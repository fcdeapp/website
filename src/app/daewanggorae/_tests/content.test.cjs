/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ts = require("typescript");
require.extensions[".ts"] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    file,
  );
const root = path.resolve(__dirname, "../../../.."),
  publicRoot = path.join(root, "public/daewanggorae/runtime");
const manifest = JSON.parse(
  fs.readFileSync(path.join(publicRoot, "manifest.json")),
);
const read = (p) =>
  JSON.parse(
    fs.readFileSync(path.join(publicRoot, "content", manifest.files[p].file)),
  );
const catalog = read("compiled/catalog.json");
const { parseDiagram } = require("../_lib/diagrams/validate.ts");
const { responsiveDiagram } = require("../_lib/diagrams/responsive.ts");
const { diagramSvg } = require("../_lib/diagrams/svg.ts");
const {
  parseQuestionMedia,
  mediaAtStage,
} = require("../_lib/questionMedia.ts");
const {
  LearningStore,
  gradeQuestion,
  nextReview,
  mergeRecords,
} = require("../_lib/records.ts");
const {
  ContentRepository,
  safePath,
  searchIndex,
} = require("../_lib/repository.ts");
test("all runtime content and model hashes match manifest", () => {
  for (const [key, file] of Object.entries(manifest.files)) {
    const b = fs.readFileSync(path.join(publicRoot, "content", file.file));
    assert.equal(b.length, file.bytes, key);
    assert.equal(
      crypto.createHash("sha256").update(b).digest("hex"),
      file.sha256,
      key,
    );
  }
  for (const model of Object.values(read("compiled/models.json"))) {
    const b = fs.readFileSync(path.join(publicRoot, "models", model.file));
    assert.equal(b.length, model.bytes);
    assert.equal(
      crypto.createHash("sha256").update(b).digest("hex"),
      model.sha256,
    );
  }
});
test("every authored lesson, question, scene and diagram resolves", () => {
  const lessons = new Set(catalog.lessons.map((x) => x.id)),
    questions = new Set(catalog.questions.map((x) => x.id)),
    scenes = new Set(catalog.scenes.map((x) => x.id));
  const diagrams = new Set(
    read("diagrams/index.json").diagrams.map((x) => x.id),
  );
  const supported = new Set([
    "heading",
    "paragraph",
    "definition",
    "clinicalPearl",
    "warning",
    "memorization",
    "misconception",
    "explanation",
    "equation",
    "table",
    "comparison",
    "derivation",
    "process",
    "flowchart",
    "clinicalCase",
    "diagnosticAlgorithm",
    "treatmentAlgorithm",
    "anatomy3d",
    "diagram",
    "image",
    "question",
    "reference",
  ]);
  for (const e of catalog.lessons) {
    const l = read(e.path);
    assert.equal(l.id, e.id);
    for (const b of l.blocks) {
      assert.ok(supported.has(b.type), b.type);
      if (b.type === "diagram") assert.ok(diagrams.has(b.diagramRef));
      if (b.type === "anatomy3d") assert.ok(scenes.has(b.sceneRef));
      if (b.type === "question") assert.ok(questions.has(b.questionRef));
    }
    for (const id of [...(l.relatedLessons || []), ...(l.prerequisites || [])])
      assert.ok(lessons.has(id), id);
  }
  for (const e of catalog.questions) {
    const q = read(e.path);
    parseQuestionMedia(q.media);
    assert.ok(lessons.has(q.lessonId));
    assert.ok(q.options.length >= 2);
    assert.equal(new Set(q.options.map((x) => x.id)).size, q.options.length);
    assert.equal(q.answer, undefined, "public display data must not contain answers");
    for (const m of q.media?.items || []) {
      if (m.type === "diagram") assert.ok(diagrams.has(m.diagramRef));
      if (m.type === "anatomy3d") assert.ok(scenes.has(m.sceneRef));
    }
    assert.ok(
      mediaAtStage(q.media, "question").every((x) => x.stage === "question"),
    );
  }
  const models = read("compiled/models.json");
  for (const e of catalog.scenes)
    for (const id of read(e.path).modelIds) assert.ok(models[id], id);
});
test("responsive diagrams generate escaped finite SVG at phone/tablet/desktop widths", () => {
  for (const e of read("diagrams/index.json").diagrams) {
    const d = parseDiagram(read(e.path), e.id);
    for (const width of [390, 768, 1280]) {
      const svg = diagramSvg(responsiveDiagram(d, width), {
        surface: "#fff",
        ink: "#17212b",
        muted: "#657482",
        border: "#e4e8ed",
        primary: "#467d9e",
        secondary: "#7a939d",
        tertiary: "#ad8064",
      });
      assert.ok(svg.includes("<svg"));
      assert.ok(!/NaN|Infinity|<script/i.test(svg), e.id);
    }
  }
});
test("search finds Korean, English and anatomical IDs without rereading lessons", () => {
  const idx = read("compiled/search.json");
  for (const q of ["심장", "heart", "FMA7088"])
    assert.ok(searchIndex(idx, q).length, q);
  assert.equal(searchIndex(idx, "").length, 0);
});
test("record persistence, guest/account isolation, deletion and last-write merge", async () => {
  const memory = new Map(),
    driver = {
      getItem: async (k) => memory.get(k) || null,
      setItem: async (k, v) => memory.set(k, v),
    },
    store = new LearningStore(driver, "test");
  await store.switchAccount("guest");
  const r = {
    id: "note:a",
    kind: "note",
    data: { lessonId: "a", text: "memo" },
    updatedAt: 1,
  };
  await store.put(r);
  await store.switchAccount("user:1");
  assert.deepEqual(store.snapshot(), {});
  await store.merge(await store.guestRecords());
  assert.equal(store.snapshot()["note:a"].data.text, "memo");
  await store.put({ ...r, deleted: true, updatedAt: 2 });
  await store.switchAccount("guest");
  assert.equal(store.snapshot()["note:a"].deleted, undefined);
  const restored = new LearningStore(driver, "test");
  await restored.switchAccount("guest");
  assert.equal(restored.snapshot()["note:a"].data.text, "memo");
  assert.equal(
    mergeRecords(
      { "note:a": r },
      { "note:a": { ...r, updatedAt: 2, deleted: true } },
    )["note:a"].deleted,
    true,
  );
});
test("grading rejects invalid answers and spaced repetition remains compatible", () => {
  const q = { answer: "a", options: [{ id: "a" }, { id: "b" }] };
  assert.equal(gradeQuestion(q, "a"), true);
  assert.equal(gradeQuestion(q, "b"), false);
  assert.throws(() => gradeQuestion(q, "x"));
  assert.equal(nextReview({}, "good", 0).due, 86400000);
  assert.equal(
    nextReview({ interval: 10, repetitions: 3 }, "again", 0).repetitions,
    0,
  );
});
test("bounded content cache deduplicates concurrent reads and rejects unsafe paths", async () => {
  let count = 0;
  const repository = new ContentRepository(
    {
      readText: async () => {
        count++;
        return '{"ok":true}';
      },
    },
    2,
  );
  await Promise.all([repository.read("a.json"), repository.read("a.json")]);
  assert.equal(count, 1);
  await repository.read("b.json");
  await repository.read("c.json");
  await repository.read("a.json");
  assert.equal(count, 4);
  for (const p of ["../a", "/a", "a/../b", "a%2fb", "https://x"])
    assert.throws(() => safePath(p));
});

test("Korea auth uses memory-only tokens, separate records and a single refresh retry", async () => {
  const memory = new Map();
  const oldFetch = global.fetch;
  const oldStorage = global.localStorage;
  global.localStorage = {
    getItem: (key) => memory.get(key) || null,
    setItem: (key, value) => memory.set(key, value),
  };
  const { study } = require("../_lib/store.ts");
  const auth = require("../_lib/auth.ts");
  const calls = [];
  let attempts = 0;
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    assert.ok(url.startsWith("https://kr.fcde.app/api/daewanggorae/"));
    const session = {
      user: { id: "web-test", email: "test@example.invalid", verified: true },
      accessToken: "access-test",
      refreshToken: "refresh-test",
    };
    if (url.endsWith("/auth/login") || url.endsWith("/auth/refresh"))
      return Response.json(session);
    if (url.endsWith("/auth/logout")) throw new TypeError("offline");
    if (++attempts === 1)
      return Response.json({ error: { message: "expired" } }, { status: 401 });
    return Response.json({ ok: true });
  };
  try {
    await study.switchAccount("guest");
    await study.put({
      id: "note:local",
      kind: "note",
      updatedAt: 1,
      data: { text: "guest" },
    });
    await auth.login(
      "test@example.invalid",
      "test-password",
      { terms: { version: "t1" }, privacy: { version: "p1" } },
      false,
    );
    assert.equal(auth.currentUser().id, "web-test");
    assert.deepEqual(study.snapshot(), {});
    const body = JSON.parse(calls[0].init.body);
    assert.deepEqual(body.consent, { terms: "t1", privacy: "p1", age14: true });
    assert.deepEqual(await auth.authenticated("/v1/me"), { ok: true });
    assert.equal(
      calls.filter((x) => x.url.endsWith("/auth/refresh")).length,
      1,
    );
    assert.ok(
      [...memory.values()].every(
        (x) => !x.includes("access-test") && !x.includes("refresh-test"),
      ),
    );
    await auth.logout();
    assert.equal(auth.currentUser(), null);
    assert.equal(study.snapshot()["note:local"].data.text, "guest");
  } finally {
    global.fetch = oldFetch;
    global.localStorage = oldStorage;
  }
});
