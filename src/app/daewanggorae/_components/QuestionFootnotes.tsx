import type { QuestionNote } from '../_lib/questions/presentation';
import { safeNoteLink } from '../_lib/questions/presentation';
import s from '../daewanggorae.module.css';
export function QuestionFootnotes({notes,id}: {notes?:QuestionNote[];id:string}) {
  if (!notes?.length) return null;
  return <aside id={id} tabIndex={-1} className={s.questionFootnotes} aria-label="출처와 자료 안내">
    <span aria-hidden="true">*</span><ul>{notes.map((note,i) => <li key={i}>{note.text}{note.links?.filter(l => safeNoteLink(l.href)).map(l => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>)}</li>)}</ul>
  </aside>;
}
