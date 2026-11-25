import Screen from "../../_components/Exams";
import { examIds } from "../../_lib/catalog";
export const dynamicParams = false;
export function generateStaticParams() {
  return examIds.map((id) => ({ examId: id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const value = await params;
  return <Screen examId={value.examId} />;
}
