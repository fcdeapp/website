import Link from "next/link";
import { books, bookEnglish, number } from "../../_lib/textbook";
import e from "../../editorial.module.css";
export function LinePattern({ variant = 0 }: { variant?: number }) {
  return (
    <svg className={e.coverPattern} viewBox="0 0 200 240" aria-hidden="true">
      {Array.from({ length: 13 }, (_, i) =>
        variant === 1 ? (
          <path key={i} d={`M ${10 + i * 12} 0 V ${200 - i * 7} H 200`} />
        ) : variant === 2 ? (
          <path
            key={i}
            d={`M 0 ${20 + i * 14} L 200 ${100 + i * 10} M ${i * 16} 0 V 240`}
          />
        ) : (
          <ellipse key={i} cx="110" cy="120" rx={20 + i * 9} ry={30 + i * 12} />
        ),
      )}
    </svg>
  );
}
export function BookCover({
  book,
  index,
}: {
  book: (typeof books)[number];
  index: number;
}) {
  return (
    <Link href={`/mdeet/textbook/${book.id}`} className={e.book}>
      <div className={e.cover} data-variant={index % 3}>
        <div className={e.coverTop}>
          <strong>MDEET.</strong>
          <span>교과서 · {number(index + 1)}</span>
        </div>
        <div className={e.coverNumber}>{number(index + 1)}</div>
        <LinePattern variant={index % 3} />
        <div className={e.coverTitle}>
          <h2>{book.title}</h2>
          <p>{bookEnglish[book.id]}</p>
        </div>
      </div>
      <div className={e.bookMeta}>
        <strong>
          {book.chapterIds.length}단원 · {book.sectionCount}학습 절
        </strong>
        <span>목차 열기</span>
      </div>
    </Link>
  );
}
export function RunningHeader({
  part,
  title,
  book,
}: {
  part: number;
  title: string;
  book: string;
}) {
  return (
    <div className={e.runningHeader}>
      <span>PART {number(part)}</span>
      <span>{title}</span>
      <span>{book}</span>
    </div>
  );
}
