import Screen from "../../_components/QuestionBank";
import { unitIds } from "../../_lib/catalog";
export const dynamicParams = false;
export function generateStaticParams() {
  return unitIds.map((id) => ({ unitId: id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const value = await params;
  return <Screen unitId={value.unitId} />;
}
