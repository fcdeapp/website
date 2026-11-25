import { TextbookReader } from "../../../_components/Textbook";
import { sections } from "../../../_lib/textbook";
export const dynamicParams = false;
export function generateStaticParams() {
  return sections.map((s) => ({ sectionId: s.id.replaceAll("/", "--") }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  return (
    <TextbookReader key={sectionId} id={sectionId.replaceAll("--", "/")} />
  );
}
