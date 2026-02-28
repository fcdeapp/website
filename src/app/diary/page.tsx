import fs from "fs/promises";
import path from "path";
import DiaryClient from "./DiaryClient";

export const dynamic = "force-static";

export type DiaryEntry = {
  slug: string;
  date: string;
  title: string;
  content: string;
  imageDataUrl: string | null;
  imageExtension: string | null;
};

const DIARY_DIR = path.join(process.cwd(), "src", "app", "diary", "content");
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "avif"] as const;

function parseDate(value: string) {
  const normalized = value.trim();

  if (/^\d{4}$/.test(normalized)) {
    return new Date(Number(normalized), 0, 1);
  }

  if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [year, month] = normalized.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function getMimeType(ext: string) {
  switch (ext.toLowerCase()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

async function getImageDataUrl(baseName: string): Promise<{
  imageDataUrl: string | null;
  imageExtension: string | null;
}> {
  for (const ext of IMAGE_EXTENSIONS) {
    const imagePath = path.join(DIARY_DIR, `${baseName}.${ext}`);

    try {
      const stat = await fs.stat(imagePath);
      if (!stat.isFile()) continue;

      const buffer = await fs.readFile(imagePath);
      const mimeType = getMimeType(ext);
      const base64 = buffer.toString("base64");

      return {
        imageDataUrl: `data:${mimeType};base64,${base64}`,
        imageExtension: ext,
      };
    } catch {
      // ignore
    }
  }

  return {
    imageDataUrl: null,
    imageExtension: null,
  };
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
        const fallbackDate =
        /^\d{4}$/.test(slug) ||
        /^\d{4}-\d{2}$/.test(slug) ||
        /^\d{4}-\d{2}-\d{2}$/.test(slug)
            ? slug
            : "";
        const finalDate = date || fallbackDate || "날짜 미상";
        const finalTitle = title || `기록 - ${finalDate}`;
        const finalContent = bodyLines.join("\n").trim();

        const { imageDataUrl, imageExtension } = await getImageDataUrl(slug);

        return {
          slug,
          date: finalDate,
          title: finalTitle,
          content: finalContent,
          imageDataUrl,
          imageExtension,
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
  return <DiaryClient entries={entries} />;
}