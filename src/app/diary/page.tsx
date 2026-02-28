import fs from "fs/promises";
import path from "path";
import styles from "../../styles/pages/Diary.module.css";

export const dynamic = "force-static";

type DiaryEntry = {
  slug: string;
  date: string;
  title: string;
  content: string;
};

const DIARY_DIR = path.join(process.cwd(), "content", "diary");

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string) {
  const date = parseDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("en-US", {
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
    const fileNames = await fs.readdir(DIARY_DIR);

    const txtFiles = fileNames.filter((file) => file.toLowerCase().endsWith(".txt"));

    const entries = await Promise.all(
      txtFiles.map(async (fileName) => {
        const fullPath = path.join(DIARY_DIR, fileName);
        const raw = await fs.readFile(fullPath, "utf-8");

        const lines = raw.split(/\r?\n/);

        let date = "";
        let title = "";
        const bodyLines: string[] = [];

        for (const line of lines) {
          if (!date && /^date\s*:/i.test(line)) {
            date = line.replace(/^date\s*:/i, "").trim();
            continue;
          }

          if (!title && /^title\s*:/i.test(line)) {
            title = line.replace(/^title\s*:/i, "").trim();
            continue;
          }

          bodyLines.push(line);
        }

        const slug = fileName.replace(/\.txt$/i, "");
        const fallbackDate = /^\d{4}-\d{2}-\d{2}$/.test(slug) ? slug : "";
        const finalDate = date || fallbackDate || "Unknown date";
        const finalTitle = title || `Diary - ${finalDate}`;
        const finalContent = bodyLines.join("\n").trim();

        return {
          slug,
          date: finalDate,
          title: finalTitle,
          content: finalContent,
        };
      })
    );

    return entries.sort((a, b) => {
      const aDate = parseDate(a.date);
      const bDate = parseDate(b.date);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return bDate.getTime() - aDate.getTime();
    });
  } catch (error) {
    console.error("Failed to load diary entries:", error);
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
            Quiet records,
            <br />
            daily traces
          </h1>

          <p className={styles.heroLead}>
            This page statically reads diary text files from a fixed directory and
            displays them with their dates and content.
          </p>

          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>
              {entries.length} entr{entries.length === 1 ? "y" : "ies"}
            </span>
            <span className={styles.metaChip}>content/diary</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerBlock}>
          <span className={styles.sectionKicker}>Archive</span>
          <h2 className={styles.sectionTitle}>Diary Entries</h2>
          <p className={styles.sectionLead}>
            Add or edit <code>.txt</code> files inside <code>content/diary</code>,
            then rebuild the site to update this page.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>No diary entries found</h3>
            <p className={styles.emptyText}>
              Put text files in <code>content/diary</code> and rebuild.
            </p>
          </div>
        ) : (
          <div className={styles.diaryGrid}>
            {entries.map((entry) => (
              <article key={entry.slug} className={styles.diaryCard}>
                <div className={styles.cardTop}>
                  <span className={styles.datePill}>{formatDate(entry.date)}</span>
                </div>

                <h3 className={styles.cardTitle}>{entry.title}</h3>

                <p className={styles.cardExcerpt}>{getExcerpt(entry.content)}</p>

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