import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import type { MergeOptions, MergeResult } from './types.js';

export class PdfMerger {
  async mergeBook(options: MergeOptions): Promise<MergeResult> {
    const startTime = Date.now();
    const { bookCode, chaptersDir, outputDir, chapterFiles, title } = options;

    try {
      await mkdir(outputDir, { recursive: true });
      const mergedPdf = await PDFDocument.create();

      let chaptersMerged = 0;

      for (const file of chapterFiles) {
        try {
          const filePath = join(chaptersDir, bookCode, file);
          const pdfBytes = await readFile(filePath);
          const pdf = await PDFDocument.load(pdfBytes, {
            ignoreEncryption: true,
          });
          const indices = pdf.getPageIndices();
          const copiedPages = await mergedPdf.copyPages(pdf, indices);
          for (const page of copiedPages) {
            mergedPdf.addPage(page);
          }
          chaptersMerged++;
        } catch (error) {
          console.warn(
            `Failed to merge ${file}:`,
            error instanceof Error ? error.message : error,
          );
        }
      }

      if (options.addTableOfContents) {
        await this.addTableOfContents(mergedPdf, chapterFiles);
      }

      const mergedBytes = await mergedPdf.save();
      const outputPath = join(
        outputDir,
        `${bookCode}-${this.sanitizeFilename(title)}.pdf`,
      );
      await writeFile(outputPath, mergedBytes);

      return {
        success: true,
        bookCode,
        outputPath,
        pageCount: mergedPdf.getPageCount(),
        fileSize: mergedBytes.length,
        chaptersMerged,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        bookCode,
        outputPath: '',
        pageCount: 0,
        fileSize: 0,
        chaptersMerged: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async addTableOfContents(
    pdfDoc: PDFDocument,
    chapterFiles: string[],
  ): Promise<void> {
    const tocPage = pdfDoc.addPage();
    const { height } = tocPage.getSize();
    tocPage.drawText('Table of Contents', {
      x: 50,
      y: height - 50,
      size: 24,
    });

    let yPos = height - 100;
    for (let i = 0; i < chapterFiles.length; i++) {
      const name = basename(chapterFiles[i] ?? '', '.pdf').replace(
        /^\d+-/,
        'Chapter ',
      );
      tocPage.drawText(`${i + 1}. ${name}`, {
        x: 50,
        y: yPos,
        size: 12,
      });
      yPos -= 25;
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
      .slice(0, 100);
  }
}
