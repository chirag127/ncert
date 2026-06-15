import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ChapterInfo } from '@ncert-library/types';

export class ChapterDownloader {
  private outputDir: string;
  private concurrency: number;
  private timeout: number;

  constructor(outputDir: string, concurrency = 3, timeout = 60000) {
    this.outputDir = outputDir;
    this.concurrency = concurrency;
    this.timeout = timeout;
  }

  async downloadBookChapters(
    bookCode: string,
    chapters: ChapterInfo[],
  ): Promise<{ downloaded: number; paths: string[] }> {
    const bookDir = join(this.outputDir, bookCode);
    await mkdir(bookDir, { recursive: true });

    const downloaded: string[] = [];
    const batches = this.chunkArray(chapters, this.concurrency);

    for (const batch of batches) {
      const promises = batch.map((ch) =>
        this.downloadChapter(bookCode, ch, bookDir),
      );
      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          downloaded.push(result.value);
        }
      }
    }

    return { downloaded: downloaded.length, paths: downloaded };
  }

  private async downloadChapter(
    _bookCode: string,
    chapter: ChapterInfo,
    bookDir: string,
  ): Promise<string | null> {
    const filename = `${String(chapter.number).padStart(2, '0')}-${this.sanitizeFilename(chapter.name)}.pdf`;
    const filePath = join(bookDir, filename);

    try {
      const response = await fetch(chapter.url, {
        signal: AbortSignal.timeout(this.timeout),
      });
      if (!response.ok) return null;

      const buffer = Buffer.from(await response.arrayBuffer());
      await mkdir(dirname(filePath), { recursive: true });

      await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(filePath);
        ws.write(buffer);
        ws.end();
        ws.on('finish', resolve);
        ws.on('error', reject);
      });

      return filePath;
    } catch {
      return null;
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
      .slice(0, 100);
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size),
    );
  }
}
