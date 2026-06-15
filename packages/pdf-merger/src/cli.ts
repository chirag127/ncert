import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { PdfMerger } from './merger.js';

async function main() {
  const chaptersDir = process.env.CHAPTERS_DIR ?? './data/chapters';
  const outputDir = process.env.OUTPUT_DIR ?? './data/merged';

  const merger = new PdfMerger();
  const bookDirs = await readdir(chaptersDir, { withFileTypes: true });

  for (const dirent of bookDirs) {
    if (!dirent.isDirectory()) continue;

    const bookCode = dirent.name;
    const chapterFiles = await readdir(join(chaptersDir, bookCode));
    const pdfFiles = chapterFiles.filter((f) => f.endsWith('.pdf')).sort();

    if (pdfFiles.length === 0) continue;

    const result = await merger.mergeBook({
      chaptersDir,
      outputDir,
      bookCode,
      title: bookCode,
      chapterFiles: pdfFiles,
      addTableOfContents: true,
    });

    console.log(
      `${result.success ? '✓' : '✗'} ${bookCode}: ${result.chaptersMerged}/${pdfFiles.length} chapters, ` +
        `${result.pageCount} pages, ${((result.fileSize ?? 0) / 1024 / 1024).toFixed(2)} MB`,
    );
  }
}

main().catch(console.error);
