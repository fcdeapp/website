import fs from "fs/promises";
import path from "path";
import styles from "@/app/styles/pages/Diary.module.css";

export const dynamic = "force-dynamic";

type DiaryEntry = {
  slug: string;
  date: string;
  title: string;
  content: string;
};

const DIARY_DIR = path.join(process.cwd(), "content", "diary");

function formatKoreanDate(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function getExcerpt(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength).trim() + "...";
}

async function getDiaryEntries(): Promise<DiaryEntry[]> {
  try {
    const files = await fs.readdir(DIARY_DIR);

    const txtFiles = files.filter((file) => file.endsWith(".txt"));

    const entries = await Promise.all(
      txtFiles.map(async (file) => {
        const fullPath = path.join(DIARY_DIR, file);
        const raw = await fs.readFile(fullPath, "utf-8");

        const lines = raw.split(/\r?\n/);

        let date = "";
        let title = "";
        const contentLines: string[] = [];

        for (const line of lines) {
          if (!date && /^date\s*:/i.test(line)) {
            date = line.replace(/^date\s*:/i, "").trim();
            continue;
          }

          if (!title && /^title\s*:/i.test(line)) {
            title = line.replace(/^title\s*:/i, "").trim();
            continue;
          }

          contentLines.push(line);
        }

        const slug = file.replace(/\.txt$/, "");
        const fallbackDate = slug.match(/^\d{4}-\d{2}-\d{2}$/) ? slug : "";
        const finalDate = date || fallbackDate || "No date";
        const finalTitle = title || `Diary - ${finalDate}`;
        const finalContent = contentLines.join("\n").trim();

        return {
          slug,
          date: finalDate,
          title: finalTitle,
          content: finalContent,
        };
      })
    );

    return entries.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();

      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;

      return bTime - aTime;
    });
  } catch (error) {
    console.error("Failed to read diary entries:", error);
    return [];
  }
}

export default async function DiaryPage() {
  const entries = await getDiaryEntries();

  return (
    <main className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroBgMesh} aria-hidden />
        <div className={styles.heroBgGlow} aria-hidden />

        <div className={styles.heroInner}>
          <span className={styles.sectionKicker}>Diary</span>
          <h1 className={styles.heroTitle}>
            Moments, thoughts,
            <br />
            and quiet records
          </h1>
          <p className={styles.heroLead}>
            Local text files are loaded from a fixed directory and displayed
            with their date and content.
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>
              Total {entries.length} entr{entries.length === 1 ? "y" : "ies"}
            </span>
            <span className={styles.metaChip}>Source: /content/diary</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerBlock}>
          <span className={styles.sectionKicker}>Archive</span>
          <h2 className={styles.sectionTitle}>Daily Notes</h2>
          <p className={styles.sectionLead}>
            Each card is generated from a <code>.txt</code> file.  
            You can manage entries by simply adding, editing, or deleting files
            in the diary folder.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>No diary entries found</h3>
            <p className={styles.emptyText}>
              Create <code>.txt</code> files inside <code>content/diary</code>{" "}
              and they will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.diaryGrid}>
            {entries.map((entry) => (
              <article key={entry.slug} className={styles.diaryCard}>
                <div className={styles.cardTop}>
                  <span className={styles.datePill}>
                    {formatKoreanDate(entry.date)}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{entry.title}</h3>

                <p className={styles.cardExcerpt}>
                  {getExcerpt(entry.content)}
                </p>

                <div className={styles.divider} />

                <div className={styles.cardBody}>
                  <pre className={styles.contentText}>{entry.content}</pre>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}