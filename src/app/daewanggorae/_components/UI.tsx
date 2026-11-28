import Link from "next/link";
import { ChevronRight } from "lucide-react";
import s from "../daewanggorae.module.css";
export const url = (page: string, id?: string) =>
  "/daewanggorae/" + page + (id ? "?id=" + encodeURIComponent(id) : "");
export function Heading({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={s.pageHeading}>
      <div>
        <h1>{title}</h1>
        {detail && <p>{detail}</p>}
      </div>
      {children}
    </div>
  );
}
export function Row({
  title,
  detail,
  number,
  meta,
  href,
  children,
}: {
  title: string;
  detail?: string;
  number?: string;
  meta?: string;
  href?: string;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      {number && <span className={s.rowNumber}>{number}</span>}
      <span className={s.rowText}>
        <strong>{title}</strong>
        {detail && <small>{detail}</small>}
      </span>
      {meta && <small className={s.meta}>{meta}</small>}
      {href && <ChevronRight size={17} />}
      {children}
    </>
  );
  return href ? (
    <Link className={s.row} href={href}>
      {body}
    </Link>
  ) : (
    <div className={s.row}>{body}</div>
  );
}
export function State({
  error,
  retry,
  empty,
}: {
  error?: string;
  retry?: () => void;
  empty?: string;
}) {
  if (!error && !empty) return <div className={s.skeleton} role="status" aria-label="자료를 불러오는 중"><div aria-hidden="true">{Array.from({length:8},(_,i)=><span key={i} />)}</div></div>;
  return (
    <div className={s.empty} role={error ? "alert" : "status"}>
      <p>{error || empty || "자료를 불러오고 있습니다."}</p>
      {error && retry && <button onClick={retry}>다시 불러오기</button>}
    </div>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; title: string }[];
}) {
  return (
    <label className={s.field}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.title}
          </option>
        ))}
      </select>
    </label>
  );
}
