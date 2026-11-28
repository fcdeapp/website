import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnatomyMaterials } from "./materials";
const materials = new AnatomyMaterials();
const emit = (payload) =>
  window.ReactNativeWebView
    ? window.ReactNativeWebView.postMessage(JSON.stringify(payload))
    : parent.postMessage({ daewanggorae: true, payload }, "*");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#F1F4F6");
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
camera.up.set(0, 0, 1);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
} catch (e) {
  emit({ type: "error", message: "이 기기에서 WebGL을 시작하지 못했습니다." });
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.screenSpacePanning = true;
scene.add(new THREE.HemisphereLight(0xffffff, 0x4d6070, 2.4));
const light = new THREE.DirectionalLight(0xffffff, 2.3);
camera.add(light);
light.position.set(0, 0, 1);
scene.add(camera);
const group = new THREE.Group();
scene.add(group);
const loader = new GLTFLoader();
const models = new Map();
let location = null, savedCamera = null, baseIds = new Set();
let current,
  animation,
  disposed = false,
  selection = "",
  transition = null,
  generation = 0,
  viewportWidth = 0,
  viewportHeight = 0;
const reset = () => {
  if (!current) return;
  const framing = location ? { ...current, bounds: location.bounds, autoFit: true } : current;
  const bounds = new THREE.Box3(
    new THREE.Vector3(...framing.bounds.min),
    new THREE.Vector3(...framing.bounds.max)
  );
  const target = new THREE.Vector3(...current.cameraTarget);
  const position = new THREE.Vector3(...current.cameraPosition);
  camera.up.set(...current.cameraUp);
  camera.fov = current.cameraFovDegrees || 35;
  if (framing.autoFit) {
    bounds.getCenter(target);
    const size = bounds.getSize(new THREE.Vector3());
    const radius = size.length() / 2;
    const fitFov = Math.min(
      (camera.fov * Math.PI) / 180,
      2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect)
    );
    const distance = Math.max(10, (radius / Math.sin(fitFov / 2)) * 1.12);
    let dir = position.clone().sub(target);
    if (dir.lengthSq() < 0.01) dir.set(0, -1, 0.2);
    position.copy(target).add(dir.normalize().multiplyScalar(distance));
    camera.far = Math.max(10000, distance * 10);
    camera.near = Math.max(0.1, distance / 10000);
  }
  transition = {
    start: performance.now(),
    duration: Math.min(current.transitionDuration || 0, 1500),
    from: camera.position.clone(),
    to: position,
    targetFrom: controls.target.clone(),
    targetTo: target,
  };
  camera.updateProjectionMatrix();
};
function disposeModels() {
  for (const mesh of [...group.children]) {
    mesh.traverse((o) => {
      o.geometry?.dispose();
      // Pooled material disposal is owned by AnatomyMaterials, once per instance.
    });
    group.remove(mesh);
  }
  models.clear();
  materials.clear();
}
function updateVisibility() {
  for (const [id, root] of models) root.visible = location
    ? location.modelIds.includes(id) && !materials.state.hidden?.includes(id)
    : baseIds.has(id) && !materials.state.hidden?.includes(id) && (!materials.state.isolate || id === selection);
}
function trimContext(keep) {
  for (const [id, root] of models) {
    if (baseIds.has(id) || keep.has(id)) continue;
    root.traverse((o) => { if (o.isMesh) materials.unregister(o); o.geometry?.dispose(); });
    group.remove(root); models.delete(id);
  }
}
window.receive = async (data) => {
  try {
    if (data.type === "scene") {
      generation++;
      disposeModels();
      current = data.scene;
      location = null; savedCamera = null; baseIds = new Set(data.scene.modelIds);
      materials.update({ location: null });
      selection = "";
      if (data.background) scene.background.set(data.background);
      reset();
    }
    if (data.type === "model") {
      if (data.sceneId !== current?.id || (data.context && (!location || !location.modelIds.includes(data.id)))) return;
      if (models.has(data.id)) { emit({ type: "loaded", id: data.id, sceneId: data.sceneId, locationId: location?.id, context: !!data.context }); return; }
      const sceneGeneration = generation;
      const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
      const parsed = await loader.parseAsync(bytes.buffer, "");
      if (
        disposed ||
        models.has(data.id) ||
        sceneGeneration !== generation ||
        data.sceneId !== current?.id ||
        (data.context && (!location || !location.modelIds.includes(data.id)))
      ) {
        parsed.scene.traverse((o) => {
          o.geometry?.dispose();
          o.material?.dispose();
        });
        return;
      }
      parsed.scene.traverse((o) => {
        if (o.isMesh) {
          // Our OBJ→GLB pipeline omits normals. Preserve valid imported normals.
          const normal = o.geometry.getAttribute("normal");
          if (!normal || normal.count !== o.geometry.getAttribute("position").count ||
              !normal.array.every(Number.isFinite) || normal.array.every((n) => n === 0)) o.geometry.computeVertexNormals();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material?.dispose();
          materials.register(o, data);
          o.userData = {
            id: data.id,
            color: data.color,
            baseOpacity: data.opacity ?? 1,
            conceptIds: data.conceptIds || [],
          };
        }
      });
      parsed.scene.visible = !materials.state.hidden?.includes(data.id) &&
        (!materials.state.isolate || data.id === materials.state.selected);
      group.add(parsed.scene);
      models.set(data.id, parsed.scene);
      updateVisibility();
      emit({ type: "loaded", id: data.id, sceneId: data.sceneId, locationId: location?.id, context: !!data.context });
    }
    if (data.type === "location" && data.sceneId === current?.id) {
      if (data.location) {
        if (!location) savedCamera = { position: camera.position.clone(), target: controls.target.clone(),
          up: camera.up.clone(), fov: camera.fov, near: camera.near, far: camera.far };
        location = data.location;
        materials.update({ location });
        trimContext(new Set(location.modelIds));
        reset();
      } else {
        location = null;
        materials.update({ location: null });
        if (savedCamera) {
          transition = null;
          camera.position.copy(savedCamera.position); controls.target.copy(savedCamera.target);
          camera.up.copy(savedCamera.up); camera.fov = savedCamera.fov;
          camera.near = savedCamera.near; camera.far = savedCamera.far;
          camera.updateProjectionMatrix(); controls.update(); savedCamera = null;
        }
      }
      updateVisibility();
    }
    if (data.type === "reset") reset();
    if (data.type === "background") scene.background.set(data.color);
    if (data.type === "mode") {
      materials.update({ mode: data.mode === "anatomical" ? "anatomical" : "default" });
    }
    if (data.type === "style") {
      selection = data.selected || "";
      materials.update({ selected: selection, hovered: data.hovered || "", hidden: data.hidden || [],
        isolate: !!data.isolate, opacity: data.opacity, highlighted: data.highlighted });
      updateVisibility();
    }
    if (data.type === "dispose") {
      disposed = true;
      cancelAnimationFrame(animation);
      disposeModels();
      controls.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    }
  } catch (e) {
    emit({ type: "error", message: String(e.message || e) });
  }
};
window.addEventListener("message", (e) => {
  if (e.source === parent) window.receive(e.data);
});
const raycaster = new THREE.Raycaster();
let down;
renderer.domElement.addEventListener("pointerdown", (e) => {
  down = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  raycaster.setFromCamera(
    new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1
    ),
    camera
  );
  const hit = raycaster.intersectObjects(group.children, true).find((h) => {
    if (location && !location.focusIds.includes(h.object.userData.id)) return false;
    let node = h.object;
    while (node) {
      if (!node.visible) return false;
      node = node.parent;
    }
    return true;
  });
  if (hit)
    emit({
      type: "selected",
      id: hit.object.userData.id,
      conceptIds: hit.object.userData.conceptIds,
    });
});
function resize() {
  const w = innerWidth,
    h = innerHeight;
  if (w < 1 || h < 1 || (w === viewportWidth && h === viewportHeight)) return;
  viewportWidth = w;
  viewportHeight = h;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (current) reset();
}
window.addEventListener("resize", resize);
resize();
function tick(now) {
  if (disposed) return;
  resize();
  if (transition) {
    let t = transition.duration
      ? Math.min(1, (now - transition.start) / transition.duration)
      : 1;
    const eased = current?.easing === "linear" ? t : t * t * (3 - 2 * t);
    camera.position.lerpVectors(transition.from, transition.to, eased);
    controls.target.lerpVectors(
      transition.targetFrom,
      transition.targetTo,
      eased
    );
    if (t === 1) transition = null;
  }
  controls.update();
  renderer.render(scene, camera);
  animation = requestAnimationFrame(tick);
}
tick(performance.now());
emit({ type: "ready" });
