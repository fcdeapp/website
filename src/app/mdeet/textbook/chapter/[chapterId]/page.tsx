import { ChapterOpening } from "../../../_components/Textbook";
import { chapters } from "../../../_lib/textbook";
export const dynamicParams = false;
export function generateStaticParams() {
  return chapters.map((c) => ({ chapterId: c.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  return <ChapterOpening id={chapterId} />;
}
