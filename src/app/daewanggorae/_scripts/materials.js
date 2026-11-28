import * as THREE from "three";
import palette from "../_lib/anatomy/palette.json";

/** Materials are immutable once pooled. State changes switch references rather
 * than recoloring a shared instance. Geometry and camera are never touched. */
export class AnatomyMaterials {
  constructor(maxIdle = 96) {
    this.pool = new Map();
    this.meshes = new Map();
    this.maxIdle = maxIdle;
    this.state = { mode: "default", selected: "", hovered: "", hidden: [], isolate: false };
  }
  register(mesh, data) {
    // Do not retain the bridge's base64 model payload after GLTF parsing.
    const { id, color, opacity, materialKey, highlighted, highlightColor, clippingPlanes } = data;
    this.meshes.set(mesh, { data: { id, color, opacity, materialKey, highlighted, highlightColor, clippingPlanes }, key: null });
    this.apply(mesh);
  }
  update(patch) {
    this.state = { ...this.state, ...patch };
    for (const mesh of this.meshes.keys()) this.apply(mesh);
    this.prune();
  }
  apply(mesh) {
    const entry = this.meshes.get(mesh);
    const d = entry.data;
    const s = this.state;
    const anatomical = s.mode === "anatomical";
    const preset = palette.presets[d.materialKey] || palette.presets.unclassified;
    const selected = d.id === s.selected;
    const hovered = d.id === s.hovered;
    const highlighted = s.highlighted === undefined ? !!d.highlighted : s.highlighted.includes(d.id);
    const baseColor = anatomical ? preset.baseColor : d.color || "#B9B8AD";
    const opacity = s.location ? (s.location.focusIds.includes(d.id) ? 1 : 0.12) : selected ? s.opacity ?? d.opacity ?? 1 : d.opacity ?? 1;
    // Keep the old default-mode selection color and material values exactly.
    const color = selected ? "#E6A963" : baseColor;
    const emissive = !selected && ((anatomical && highlighted) || hovered) ? d.highlightColor || "#467D9E" : "#000000";
    const emissiveIntensity = hovered ? 0.16 : anatomical && highlighted ? 0.12 : 0;
    const roughness = anatomical ? preset.roughness : 0.74;
    const metalness = anatomical ? preset.metallic : 0;
    const planes = s.clippingPlanes || d.clippingPlanes || [];
    const clipping = planes.map((p) => [...p.normal.toArray(), p.constant]);
    const key = JSON.stringify([color, roughness, metalness, opacity, emissive, emissiveIntensity, clipping]);
    if (key === entry.key) return;
    if (entry.key) this.pool.get(entry.key).refs--;
    let pooled = this.pool.get(key);
    if (!pooled) {
      const material = new THREE.MeshStandardMaterial({
        // CSS hex colors are sRGB; Three.Color converts once to linear working space.
        color, roughness, metalness, emissive, emissiveIntensity,
        side: THREE.DoubleSide, transparent: true, opacity,
        depthWrite: opacity > 0.95, clippingPlanes: planes.map((p) => p.clone()),
      });
      pooled = { material, refs: 0 };
      this.pool.set(key, pooled);
    }
    pooled.refs++;
    mesh.material = pooled.material;
    entry.key = key;
  }
  prune() {
    let idle = [...this.pool.values()].filter((v) => v.refs === 0).length;
    for (const [key, value] of this.pool) {
      if (idle <= this.maxIdle) break;
      if (value.refs === 0) { value.material.dispose(); this.pool.delete(key); idle--; }
    }
  }
  unregister(mesh) {
    const entry = this.meshes.get(mesh);
    if (entry?.key) this.pool.get(entry.key).refs--;
    this.meshes.delete(mesh);
    this.prune();
  }
  clear() {
    for (const { material } of this.pool.values()) material.dispose();
    this.pool.clear();
    this.meshes.clear();
  }
}
