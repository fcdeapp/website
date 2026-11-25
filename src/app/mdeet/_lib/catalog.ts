import index from "../../../../public/mdeet/index.json";
import units from "../../../../public/mdeet/units.json";
export const questionIds = index.questions.map((q) => q.id);
export const unitIds = units.units.map((u) => u.id);
export { examIds } from "./exams";
