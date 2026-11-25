/* eslint-disable @typescript-eslint/no-require-imports -- Node's CommonJS test runner loads temporary compiled modules. */
// Run from website/: node --test src/app/mdeet/_tests/core.test.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");
const website = path.resolve(__dirname, "../../../..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "mdeet-core-test-"));
const lib = path.resolve(__dirname, "../_lib");
execFileSync(
  path.join(website, "node_modules/.bin/tsc"),
  [
    ...["storage", "scoring", "scheduler", "mastery", "sessions"].map((n) =>
      path.join(lib, `${n}.ts`),
    ),
    "--outDir",
    out,
    "--rootDir",
    lib,
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--skipLibCheck",
    "--strict",
  ],
  { cwd: website, stdio: "pipe" },
);
const { emptyStore, parseStore } = require(path.join(out, "storage"));
const { makeAttempt, recordAttempt, remaining, summary } = require(
  path.join(out, "scoring"),
);
const { blankLearning, nextReview, scheduleCard, due } = require(
  path.join(out, "scheduler"),
);
const { mastery } = require(path.join(out, "mastery"));
const dataset = path.join(website, "public/mdeet");
const index = JSON.parse(fs.readFileSync(path.join(dataset, "index.json")));
const units = JSON.parse(
  fs.readFileSync(path.join(dataset, "units.json")),
).units;
const questions = index.questions.map((meta) =>
  JSON.parse(
    fs.readFileSync(path.join(dataset, "questions", `${meta.id}.json`)),
  ),
);
const ids = new Set(questions.map((q) => q.id));
const unitIds = new Set(units.map((u) => u.id));
const at = Date.parse("2026-11-25T10:00:00Z");
const q = questions.find(
  (q) =>
    q.answer != null &&
    q.points != null &&
    (q.acceptedAnswers?.length ?? 1) === 1,
);
const attempt = (id, answer = q.answer, confidence = "high", now = at) =>
  makeAttempt(q, answer, confidence, 12000, "study", id, now);
test("expanded catalog, source exam membership, counts and known totals agree", () => {
  assert.equal(questions.length, index.count);
  assert.equal(ids.size, index.count);
  const exams = JSON.parse(
    fs.readFileSync(path.join(dataset, "exams.json")),
  ).exams;
  questions.forEach((q, i) => {
    for (const key of [
      "id",
      "year",
      "subject",
      "number",
      "points",
      "unitId",
      "unitLabel",
      "topic",
    ])
      assert.equal(q[key], index.questions[i][key], `${q.id}: ${key}`);
    assert.deepEqual(
      q.options.map((o) => o.number),
      [1, 2, 3, 4, 5],
    );
    assert.ok(q.answer === null || (q.answer >= 1 && q.answer <= 5));
    assert.ok(units.find((u) => u.id === q.unitId)?.questionIds.includes(q.id));
  });
  const covered = new Set();
  for (const exam of exams) {
    assert.equal(exam.questionIds.length, exam.questionCount);
    const members = exam.questionIds.map((id) =>
      questions.find((q) => q.id === id),
    );
    assert.ok(members.every(Boolean));
    members.forEach((q) => covered.add(q.id));
    if (exam.pointsTotal != null)
      assert.equal(
        members.reduce((n, q) => n + q.points, 0),
        exam.pointsTotal,
      );
  }
  assert.equal(covered.size, ids.size);
});
test("all source images and text references resolve; multi-region and image-only choices exist", () => {
  let assets = 0;
  for (const q of questions) {
    const assetIds = new Set(q.assets.map((a) => a.id));
    const textIds = new Set(
      q.layout.flatMap((r) =>
        r.items.filter((i) => i.type === "text").map((i) => i.id),
      ),
    );
    for (const a of q.assets) {
      assert.ok(a.src.startsWith("/mdeet/assets/"));
      assert.ok(fs.existsSync(path.join(website, "public", a.src)));
      assets++;
    }
    for (const r of q.layout) {
      assert.ok(r.width > 0 && r.height > 0);
      for (const item of r.items) {
        if (item.type === "image") assert.ok(assetIds.has(item.assetId));
        else
          for (const span of item.spans) {
            assert.ok(span.origin.every(Number.isFinite));
            assert.ok(Number.isFinite(span.size));
            if (/[\uE000-\uF8FF]/u.test(span.text))
              assert.ok(q.reviewFlags.length > 0, q.id);
          }
      }
    }
    for (const o of q.options) {
      o.assetIds.forEach((id) => assert.ok(assetIds.has(id)));
      o.textItemIds.forEach((id) => assert.ok(textIds.has(id)));
    }
  }
  assert.ok(assets > 0);
  assert.equal(
    questions.find((q) => q.id === "mdeet-2023-biology-30").layout.length,
    2,
  );
  assert.ok(
    questions
      .find((q) => q.id === "mdeet-2023-chemistry-30")
      .options.every((o) => !o.text && o.assetIds.length),
  );
});
test("one-based correct, incorrect and unanswered scores use source points", () => {
  for (const q of questions) {
    const accepted = q.acceptedAnswers ?? (q.answer == null ? [] : [q.answer]);
    for (let choice = 0; choice <= 5; choice++) {
      const a = makeAttempt(q, choice, "high", 1000, "exam", "a", at);
      assert.equal(a.correct, accepted.includes(choice));
      assert.equal(a.ungraded, accepted.length === 0);
      assert.equal(
        a.pointsEarned,
        accepted.includes(choice) ? (q.points ?? 0) : 0,
      );
      assert.equal(a.pointsUnknown, q.points === null);
    }
  }
});
test("duplicate submission is idempotent and source records stay untouched", () => {
  const a = attempt("a");
  const st = recordAttempt(emptyStore(), a);
  assert.equal(recordAttempt(st, a), st);
  assert.equal(st.attempts.length, 1);
  assert.equal(q.attempts, undefined);
});
test("first, latest and repeated accuracy are distinct", () => {
  const s = summary([
    attempt("b", q.answer, "high", at + 1000),
    attempt("a", (q.answer % 5) + 1),
  ]);
  assert.equal(s.first[0].correct, false);
  assert.equal(s.latest[0].correct, true);
  assert.equal(s.repeats.length, 1);
  assert.equal(s.totalMs, 24000);
});
test("review intervals advance, reset on errors, and record due completions", () => {
  const first = nextReview(blankLearning(), true, "high", at);
  assert.equal(Date.parse(first.nextReviewAt) - at, 86400000);
  const next = nextReview(first, true, "high", at + 86400000);
  assert.equal(next.reviewStep, 1);
  assert.equal(Date.parse(next.nextReviewAt) - (at + 86400000), 3 * 86400000);
  assert.equal(nextReview(next, false, "high", at).reviewStep, 0);
  assert.equal(nextReview(next, true, "low", at).reviewStep, 0);
  assert.equal(due(first, at), false);
  assert.equal(due(first, at + 86400001), true);
  assert.equal(
    recordAttempt(
      { ...emptyStore(), learning: { [q.id]: first } },
      attempt("r", q.answer, "high", at + 86400001),
    ).attempts[0].wasDue,
    true,
  );
});
test("card ratings schedule deterministic intervals", () => {
  assert.equal(
    Date.parse(scheduleCard(3, "again", at).nextReviewAt) - at,
    600000,
  );
  assert.equal(scheduleCard(2, "hard", at).step, 2);
  assert.equal(scheduleCard(2, "good", at).step, 3);
  assert.equal(scheduleCard(2, "easy", at).step, 4);
});
test("absolute deadlines survive serialization and background elapsed time", () => {
  const restored = JSON.parse(
    JSON.stringify({ endsAt: new Date(at + 60000).toISOString() }),
  );
  assert.equal(remaining(restored, at + 10000), 50000);
  assert.equal(remaining(restored, at + 90000), 0);
  assert.equal(remaining({}, at), null);
});
test("export/import round-trips; malformed, foreign, duplicated and impossible records fail", () => {
  const st = recordAttempt(emptyStore(), attempt("a"));
  assert.deepEqual(
    parseStore(JSON.stringify(st), ids, unitIds),
    JSON.parse(JSON.stringify(st)),
  );
  assert.throws(() => parseStore("{bad"));
  assert.throws(() => parseStore(JSON.stringify({ ...st, version: 99 })));
  for (const patch of [
    { durationMs: -1 },
    { selectedOption: 6 },
    { questionId: "mdeet-2099-biology-01" },
    { correct: false, pointsEarned: 4 },
  ])
    assert.throws(() =>
      parseStore(
        JSON.stringify({ ...st, attempts: [{ ...st.attempts[0], ...patch }] }),
        ids,
        unitIds,
      ),
    );
  assert.throws(() =>
    parseStore(
      JSON.stringify({ ...st, attempts: [st.attempts[0], st.attempts[0]] }),
    ),
  );
});
test("session import checks answer keys, question index, exam grading and deadlines", () => {
  const session = {
    id: "session",
    mode: "exam",
    examId: "2023-biology",
    questionIds: [q.id],
    current: 0,
    answers: { [q.id]: 1 },
    confidence: { [q.id]: "high" },
    flagged: [],
    durations: { [q.id]: 500 },
    startedAt: new Date(at).toISOString(),
    endsAt: new Date(at + 60000).toISOString(),
    grading: "end",
    gradedIds: [],
  };
  const st = { ...emptyStore(), sessions: [session] };
  assert.deepEqual(
    parseStore(JSON.stringify(st), ids, unitIds),
    JSON.parse(JSON.stringify(st)),
  );
  for (const patch of [
    { current: 1 },
    { answers: { bad: 1 } },
    { answers: { [q.id]: 0 } },
    { grading: "immediate" },
    { endsAt: new Date(at - 1).toISOString() },
  ])
    assert.throws(() =>
      parseStore(
        JSON.stringify({ ...st, sessions: [{ ...session, ...patch }] }),
      ),
    );
});
test("mastery remains unknown for sparse data and is bounded", () => {
  assert.equal(mastery([attempt("1")], 30, at), null);
  const a = [attempt("1"), attempt("2"), attempt("3")];
  assert.ok(mastery(a, 30, at) >= 0 && mastery(a, 30, at) <= 100);
  assert.ok(mastery(a, 30, at + 30 * 86400000) <= mastery(a, 30, at));
});

test("untranscribed keys preserve answers without wrong-answer stats or scheduled mistakes", () => {
  const missing = questions.find(
    (q) => q.answer === null && !q.acceptedAnswers?.length,
  );
  assert.ok(missing);
  const st = recordAttempt(
    emptyStore(),
    makeAttempt(missing, 2, "high", 1000, "study", "pending", at),
  );
  assert.equal(st.attempts[0].selectedOption, 2);
  assert.equal(st.attempts[0].ungraded, true);
  assert.equal(summary(st.attempts).first.length, 0);
  assert.equal(st.learning[missing.id].nextReviewAt, undefined);
  assert.deepEqual(
    parseStore(JSON.stringify(st), ids, unitIds),
    JSON.parse(JSON.stringify(st)),
  );
});
test("textbook indices preserve all sections, blocks, knowledge and source cards", () => {
  const textbook = JSON.parse(
    fs.readFileSync(path.join(dataset, "textbook/index.json")),
  );
  const knowledge = JSON.parse(
    fs.readFileSync(path.join(dataset, "knowledge/index.json")),
  );
  const cards = JSON.parse(
    fs.readFileSync(path.join(dataset, "flashcards/index.json")),
  );
  let knowledgeCount = 0,
    cardCount = 0,
    blocks = 0;
  const blockTypes = new Set();
  for (const section of textbook.sections) {
    const body = JSON.parse(
      fs.readFileSync(path.join(website, "public", section.url)),
    );
    assert.equal(body.id, section.id);
    assert.ok(body.blocks.length);
    blocks += body.blocks.length;
    body.blocks.forEach((b) => {
      assert.ok(["paragraph", "keyFacts", "table"].includes(b.type));
      blockTypes.add(b.type);
      if (b.type === "table")
        b.rows.forEach((row) => assert.equal(row.length, b.headers.length));
    });
    const k = knowledge.sections.find((k) => k.id === section.id);
    assert.ok(k);
    const items = JSON.parse(
      fs.readFileSync(path.join(website, "public", k.url)),
    ).items;
    assert.equal(items.length, section.knowledgeCount);
    assert.deepEqual(
      new Set(items.map((k) => k.id)),
      new Set(body.knowledgeIds),
    );
    knowledgeCount += items.length;
    const source = cards.sections.find((c) => c.id === section.id);
    assert.ok(source);
    const deck = JSON.parse(
      fs.readFileSync(path.join(website, "public", source.url)),
    ).cards;
    cardCount += deck.length;
    deck.forEach((c) => assert.ok(items.some((k) => k.id === c.knowledgeId)));
    body.relatedQuestionIds.forEach((id) => assert.ok(ids.has(id)));
  }
  assert.equal(knowledgeCount, knowledge.count);
  assert.equal(cardCount, cards.count);
  assert.ok(blocks >= textbook.sections.length);
  assert.equal(blockTypes.size, 3);
  textbook.books.forEach((b) => {
    const ch = textbook.chapters.filter((c) => c.book === b.id);
    assert.deepEqual(
      ch.map((c) => c.id),
      b.chapterIds,
    );
    assert.equal(
      ch.reduce((n, c) => n + c.sections.length, 0),
      b.sectionCount,
    );
  });
});
test("optional textbook records round-trip alongside existing legacy records", () => {
  const original = recordAttempt(emptyStore(), attempt("legacy"));
  const expanded = {
    ...original,
    textbook: {
      lastSectionId: "enzyme/kinetics",
      sections: {
        "enzyme/kinetics": {
          notes: "메모",
          completed: true,
          lastReadAt: new Date(at).toISOString(),
        },
      },
      knowledge: {
        "enzyme--kinetics-k001": { understood: true, memorized: false },
      },
      reviews: {
        "knowledge:enzyme--kinetics-k001": {
          step: 1,
          nextReviewAt: new Date(at).toISOString(),
          history: [{ at: new Date(at).toISOString(), rating: "good" }],
        },
      },
    },
  };
  const restored = parseStore(JSON.stringify(expanded), ids, unitIds);
  assert.deepEqual(
    restored.attempts,
    JSON.parse(JSON.stringify(original.attempts)),
  );
  assert.deepEqual(restored.textbook, expanded.textbook);
  assert.throws(() =>
    parseStore(
      JSON.stringify({
        ...expanded,
        textbook: { ...expanded.textbook, reviews: { bad: { step: -1 } } },
      }),
    ),
  );
});
