import Screen from "../../_components/QuestionStudy";
import { questionIds } from "../../_lib/catalog";
export const dynamicParams = false;
export function generateStaticParams() {
  return questionIds.map((id) => ({ questionId: id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const value = await params;
  return <Screen id={value.questionId} />;
}
