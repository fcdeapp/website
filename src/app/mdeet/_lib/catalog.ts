import index from "../../../../public/mdeet/index.json";
import units from "../../../../public/mdeet/units.json";
export const questionIds = index.questions.map((q) => q.id);
export const unitIds = units.units.map((u) => u.id);
export const examIds = [
  ...new Set(index.questions.map((q) => `${q.year}-${q.subject}`)),
];
