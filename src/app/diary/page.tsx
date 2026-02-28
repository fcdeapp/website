import fs from "fs/promises";
import path from "path";
import styles from "../../styles/pages/Diary.module.css";
import DiaryClient from "./DiaryClient";

export const dynamic = "force-static";

export type DiaryEntry = {
  slug: string;
  date: string;
  title: string;
  content: string;
};

const DIARY_DIR = path.join(process.cwd(), "src", "app", "diary", "content");

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function getDiaryEntries(): Promise<DiaryEntry[]> {
  try {
    const dirStat = await fs.stat(DIARY_DIR);
    if (!dirStat.isDirectory()) {
      return [];
    }

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
        const finalDate = date || fallbackDate || "날짜 미상";
        const finalTitle = title || `기록 - ${finalDate}`;
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
            조용히 남겨 둔 마음들,
            <br />
            날짜 위의 기록
          </h1>

          <p className={styles.heroLead}>
            이곳에는 지나간 생각과 고민, 흔들리던 날의 감정들을 차분히 모아두었습니다.
            원하는 날짜를 누르면 그날의 기록을 바로 펼쳐볼 수 있습니다.
          </p>

          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>
              총 {entries.length}개의 기록
            </span>
            <span className={styles.metaChip}>src/app/diary/content</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerBlock}>
          <span className={styles.sectionKicker}>Archive</span>
          <h2 className={styles.sectionTitle}>날짜별 기록 보기</h2>
          <p className={styles.sectionLead}>
            이 페이지는 단순한 메모 보관함이 아니라, 그날그날의 고민과 마음을 다시 들여다보는 작은 아카이브입니다.
            아래 달력에서 날짜를 누르면 해당 기록만 바로 확인할 수 있습니다.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>아직 표시할 기록이 없습니다</h3>
            <p className={styles.emptyText}>
              <code>src/app/diary/content</code> 폴더에 <code>.txt</code> 파일을 추가한 뒤 다시 빌드하면 이 페이지에 반영됩니다.
            </p>
          </div>
        ) : (
          <DiaryClient entries={entries} />
        )}
      </section>
    </main>
  );
}