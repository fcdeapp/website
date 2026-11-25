import { BookContents } from "../../_components/Textbook";
import { books } from "../../_lib/textbook";
export const dynamicParams = false;
export function generateStaticParams() {
  return books.map((b) => ({ bookId: b.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  return <BookContents id={bookId} />;
}
