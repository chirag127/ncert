import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright';
import { NcertScraper } from './scraper.js';

const NCERT_BASE = 'https://ncert.nic.in';

async function enrichWithChapterNames(
  browser: Browser,
  books: Array<{
    bookCode: string;
    bookUrlValue?: string;
    chapters?: Array<{ number: number; name: string; url: string }>;
  }>,
): Promise<void> {
  const page = await browser.newPage();

  for (const book of books) {
    if (!book.chapters || book.chapters.length === 0) continue;

    const bookCode = book.bookCode;
    if (!bookCode) continue;

    try {
      const url = `${NCERT_BASE}/textbook.php?${bookCode}=0-${book.chapters.length}&ln=en`;

      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(3000);

      const chapterNames = await page.evaluate((expectedCount: number) => {
        const names: Record<number, string> = {};

        const html = document.body.innerHTML ?? '';

        const tablePattern = /(?:Chapter|CHAPTER|Unit|UNIT)\s*(\d+)\s*[–\-:.\s]*([^<]{2,200}?)(?:<\/|<\/(?:td|p|div|strong|br)|<br)/gi;
        let match: RegExpExecArray | null;
        while ((match = tablePattern.exec(html)) !== null) {
          const num = Number.parseInt(match[1]!, 10);
          const name = match[2]?.trim();
          if (num > 0 && num <= expectedCount && name && name.length > 2) {
            names[num] = name;
          }
        }

        const tables = document.querySelectorAll('table');
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const text = row.textContent?.trim() ?? '';
            const chMatch = text.match(
              /(?:Chapter|CHAPTER|Unit|UNIT)\s*(\d+)\s*[–\-:.\s]+(.+)/,
            );
            if (chMatch) {
              const chNum = Number.parseInt(chMatch[1]!, 10);
              const nameText = chMatch[2]?.trim() ?? '';
              if (chNum > 0 && chNum <= expectedCount && nameText.length > 2) {
                names[chNum] = nameText.replace(/\s+/g, ' ').substring(0, 150);
              }
            }
          }
        }

        const links = document.querySelectorAll('a');
        for (const link of links) {
          const href = link.getAttribute('href') ?? '';
          const pdfMatch = href.match(/textbook\/pdf\/[a-z]+\d+(\d{2})\.pdf/i);
          if (pdfMatch) {
            const chNum = Number.parseInt(pdfMatch[1]!, 10);
            const linkText = link.textContent?.trim() ?? '';
            if (chNum > 0 && chNum <= expectedCount && linkText.length > 2) {
              names[chNum] = linkText;
            }
          }
        }

        return names;
      }, book.chapters.length);

      for (const chapter of book.chapters) {
        const chapterName = chapterNames[chapter.number];
        if (chapterName) {
          chapter.name = chapterName;
        }
      }

      const foundCount = Object.keys(chapterNames).length;
      if (foundCount > 0) {
        console.log(`  Enriched ${bookCode}: ${foundCount}/${book.chapters.length} chapters named`);
      }
    } catch {
      // Silently skip enrichment failures
    }
  }

  await page.close();
}

async function main() {
  const outputDir = process.env.OUTPUT_DIR ?? './data';
  const scraper = new NcertScraper({
    outputDir: join(outputDir, 'chapters'),
    headless: true,
    skipDownload: true,
  });

  try {
    await scraper.initialize();
    const results = await scraper.scrapeAllBooks();

    const booksDir = join(outputDir, 'metadata');
    await mkdir(booksDir, { recursive: true });

    const booksData = results
      .filter((r) => r.success && r.chapters && r.chapters.length > 0)
      .map((r) => ({
        bookCode: r.bookCode,
        class: r.class,
        subject: r.subject,
        language: r.language,
        title: r.title,
        editionYear: 2024,
        numberOfChapters: r.chaptersScraped,
        chapterNames: r.chapters?.map((c) => c.name) ?? [],
        chapterUrls: r.chapters?.map((c) => c.url) ?? [],
        chapters: r.chapters?.map((c) => ({
          number: c.number,
          name: c.name,
          url: c.url,
        })),
        downloadUrl: `${NCERT_BASE}/textbook/pdf/${r.bookCode}.pdf`,
        tags: [r.class, r.subject, r.language, 'ncert', 'cbse']
          .filter((t): t is string => !!t),
        keywords: [
          r.title.toLowerCase(),
          r.subject,
          r.class.replace('class-', 'class '),
          r.language,
        ].filter((k): k is string => !!k),
        description: `NCERT ${r.title} textbook for ${r.class.replace('class-', 'Class ')} ${r.subject} (${r.language}). Contains ${r.chaptersScraped} chapters.`,
      }));

    console.log('\n=== Enriching chapter names ===');
    const browser = await chromium.launch({ headless: true });
    await enrichWithChapterNames(
      browser,
      booksData as Array<{
        bookCode: string;
        bookUrlValue?: string;
        chapters?: Array<{ number: number; name: string; url: string }>;
      }>,
    );
    await browser.close();

    const booksJsonPath = join(booksDir, 'books.json');
    await writeFile(booksJsonPath, JSON.stringify(booksData, null, 2));
    console.log(`\nWrote books.json with ${booksData.length} books`);

    const statsPath = join(outputDir, 'scrape-stats.json');
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    const byClass: Record<string, number> = {};
    const bySubject: Record<string, number> = {};
    const byLang: Record<string, number> = {};
    for (const b of booksData) {
      byClass[b.class] = (byClass[b.class] ?? 0) + 1;
      bySubject[b.subject] = (bySubject[b.subject] ?? 0) + 1;
      byLang[b.language] = (byLang[b.language] ?? 0) + 1;
    }

    await writeFile(
      statsPath,
      JSON.stringify(
        {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
          totalChapters: successful.reduce(
            (sum, r) => sum + r.chaptersScraped,
            0,
          ),
          byClass,
          bySubject,
          byLanguage: byLang,
          failedBooks: failed.map((r) => ({
            bookCode: r.bookCode,
            errors: r.errors,
          })),
        },
        null,
        2,
      ),
    );

    console.log(`\n=== Scrape Complete ===`);
    console.log(`Books with chapters: ${booksData.length}`);
    console.log(`Total chapters: ${booksData.reduce((s, b) => s + b.numberOfChapters, 0)}`);
    console.log(`By language: ${JSON.stringify(byLang)}`);
    console.log(`By class: ${JSON.stringify(byClass)}`);
    console.log(`Output: ${booksJsonPath}`);
  } finally {
    await scraper.destroy();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
