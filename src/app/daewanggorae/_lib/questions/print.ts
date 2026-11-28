import type { DisplayQuestion } from "./model";
import { printDocument } from "./render";
export function openQuestionPrint(questions: DisplayQuestion[]) {
  const tab = window.open("about:blank", "_blank");
  if (!tab) throw new Error("인쇄 창을 열 수 없습니다. 팝업을 허용해 주세요.");
  tab.opener = null;
  tab.document.open();
  tab.document.write(printDocument(questions));
  tab.document.close();
}
