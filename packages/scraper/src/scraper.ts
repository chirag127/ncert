import type {
  ChapterInfo,
  GradeLevel,
  Language,
  Subject,
} from '@ncert-library/types';
import { type Browser, chromium } from 'playwright';
import type { NcertBookPage, ScrapeOptions, ScrapeResult } from './types.js';

const NCERT_BASE = 'https://ncert.nic.in';
const PDF_BASE = `${NCERT_BASE}/textbook/pdf`;

const SUBJECT_MAP: Record<string, Subject> = {
  mathematics: 'mathematics',
  math: 'mathematics',
  maths: 'mathematics',
  ganit: 'mathematics',
  science: 'science',
  vigyan: 'science',
  'social science': 'social-science',
  'social studies': 'social-science',
  english: 'english',
  hindi: 'hindi',
  sanskrit: 'sanskrit',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  history: 'history',
  geography: 'geography',
  'political science': 'political-science',
  economics: 'economics',
  accountancy: 'accountancy',
  'business studies': 'business-studies',
  'informatics practices': 'informatics-practices',
  'computer science': 'computer-science',
  psychology: 'psychology',
  sociology: 'sociology',
  philosophy: 'philosophy',
  'fine art': 'fine-arts',
  'fine arts': 'fine-arts',
  music: 'music',
  sangeet: 'music',
  dance: 'dance',
  'physical education': 'physical-education',
  'home science': 'other',
  urdu: 'urdu',
  arts: 'art-education',
  biotechnology: 'other',
  'creative writing': 'other',
  'environmental studies': 'environmental-studies',
  evs: 'environmental-studies',
};

const HINDI_SUBJECT_MAP: Record<string, Subject> = {
  // Maths
  गणित: 'mathematics',
  // Science (general + branches)
  विज्ञान: 'science',
  भौतिकी: 'physics',
  'भौतिक विज्ञान': 'physics',
  रसायन: 'chemistry',
  'रसायन विज्ञान': 'chemistry',
  जीव: 'biology',
  'जीव विज्ञान': 'biology',
  जीवविज्ञान: 'biology',
  'जीवविज्ञान भाग': 'biology',
  'जैव प्रौद्योगिकी': 'other',
  // Social science
  'सामाजिक विज्ञान': 'social-science',
  इतिहास: 'history',
  भूगोल: 'geography',
  राजनीति: 'political-science',
  'राजनीति विज्ञान': 'political-science',
  अर्थशास्त्र: 'economics',
  समाजशास्त्र: 'sociology',
  // Languages
  हिंदी: 'hindi',
  हिन्दी: 'hindi',
  अंग्रेज़ी: 'english',
  अंग्रेजी: 'english',
  संस्कृत: 'sanskrit',
  उर्दू: 'urdu',
  // Commerce & humanities
  लेखाकर्म: 'accountancy',
  लेखाशास्त्र: 'accountancy',
  व्यवसाय: 'business-studies',
  'व्यवसाय अध्ययन': 'business-studies',
  मनोविज्ञान: 'psychology',
  दर्शनशास्त्र: 'philosophy',
  // Arts & misc.
  'गृह विज्ञान': 'other',
  'पर्यावरण अध्ययन': 'environmental-studies',
  'शारीरिक शिक्षा': 'physical-education',
  कला: 'art-education',
  संगीत: 'music',
  नृत्य: 'dance',
  'कंप्यूटर विज्ञान': 'computer-science',
  'सूचना प्रौद्योगिकी': 'informatics-practices',
};

const CLASS_VALUE_MAP: Record<string, GradeLevel> = {
  '1': 'class-1',
  '2': 'class-2',
  '3': 'class-3',
  '4': 'class-4',
  '5': 'class-5',
  '6': 'class-6',
  '7': 'class-7',
  '8': 'class-8',
  '9': 'class-9',
  '10': 'class-10',
  '11': 'class-11',
  '12': 'class-12',
};

interface DiscoveredBook {
  bookCode: string;
  bookUrlValue: string;
  bookTitle: string;
  classValue: string;
  subjectText: string;
  ln: string;
  language: Language;
  maxChapters: number;
}

export class NcertScraper {
  private browser: Browser | null = null;
  private options: ScrapeOptions;

  constructor(options: Partial<ScrapeOptions> = {}) {
    this.options = {
      outputDir: options.outputDir ?? './data/chapters',
      headless: options.headless ?? true,
      concurrency: options.concurrency ?? 2,
      timeout: options.timeout ?? 60000,
      retryAttempts: options.retryAttempts ?? 3,
      retryDelay: options.retryDelay ?? 2000,
      skipDownload: options.skipDownload ?? false,
      forceRefresh: options.forceRefresh ?? false,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeAllBooks(): Promise<ScrapeResult[]> {
    if (!this.browser) await this.initialize();

    const discovered = await this.discoverAllBooks();
    console.log(`\nDiscovered ${discovered.length} books total`);

    const englishBooks = discovered.filter((b) => b.language === 'english');
    const hindiBooks = discovered.filter((b) => b.language === 'hindi');
    console.log(
      `Processing ${englishBooks.length} English + ${hindiBooks.length} Hindi books`,
    );

    const results: ScrapeResult[] = [];
    for (const book of discovered) {
      try {
        const result = this.buildBookResult(book);
        results.push(result);
      } catch (error) {
        console.error(
          `  \u2717 ${book.bookTitle}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return results;
  }

  private async discoverAllBooks(): Promise<DiscoveredBook[]> {
    const allBooks: DiscoveredBook[] = [];
    const context = await this.browser!.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
      for (const ln of ['en', 'hi'] as const) {
        const language: Language = ln === 'en' ? 'english' : 'hindi';
        console.log(`\n[PW] Loading NCERT textbook page for ${language}...`);

        await page.goto(`${NCERT_BASE}/textbook.php?ln=${ln}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
        await page.waitForSelector('select[name="tclass"]', { timeout: 15000 });

        const classOptions = await page.evaluate(() => {
          const select = document.querySelector(
            'select[name="tclass"]',
          ) as HTMLSelectElement | null;
          if (!select) return [];
          return Array.from(select.options)
            .filter((o) => o.value && o.value !== '-1')
            .map((o) => ({ value: o.value, text: o.text.trim() }));
        });

        console.log(
          `  Found ${classOptions.length} classes: ${classOptions.map((c) => c.value).join(',')}`,
        );

        let classCount = 0;
        for (const cls of classOptions) {
          classCount++;
          console.log(
            `  Class ${cls.value} (${cls.text}) [${classCount}/${classOptions.length}]`,
          );

          await page.selectOption('select[name="tclass"]', cls.value);
          await page.waitForTimeout(2000);

          try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            await page.waitForSelector(
              'select[name="tsubject"] option:not([value="-1"])',
              {
                timeout: 6000,
              },
            );
          } catch {
            console.log(`    No subjects found for class ${cls.value}`);
            continue;
          }

          const subjectOptions = await page.evaluate(() => {
            const select = document.querySelector(
              'select[name="tsubject"]',
            ) as HTMLSelectElement | null;
            if (!select) return [];
            const opts = Array.from(select.options)
              .filter((o) => o.value && o.value !== '-1' && o.text.trim())
              .map((o) => ({ value: o.value, text: o.text.trim() }));
            console.log(
              `    Found ${opts.length} subjects for class ${cls.value}`,
            );
            return opts;
          });

          for (const subject of subjectOptions) {
            await page.selectOption('select[name="tsubject"]', subject.value);
            await page.waitForTimeout(2000);

            try {
              await page.waitForLoadState('networkidle', { timeout: 10000 });
              await page.waitForSelector(
                'select[name="tbook"] option:not([value="-1"])',
                { timeout: 6000 },
              );
            } catch {
              continue;
            }

            const bookOptions = await page.evaluate(() => {
              const select = document.querySelector(
                'select[name="tbook"]',
              ) as HTMLSelectElement | null;
              if (!select) return [];
              return Array.from(select.options)
                .filter((o) => o.value && o.value !== '-1' && o.text.trim())
                .map((o) => ({ value: o.value, text: o.text.trim() }));
            });

            console.log(
              `      Found ${bookOptions.length} books for ${subject.text}`,
            );

            for (const book of bookOptions) {
              const bookCode = this.extractBookCode(book.value);
              const maxCh = this.extractMaxChapters(book.value);

              allBooks.push({
                bookCode,
                bookUrlValue: book.value,
                bookTitle: book.text,
                classValue: cls.value,
                subjectText: subject.text,
                ln,
                language,
                maxChapters: maxCh,
              });
            }
          }
        }
      }
    } finally {
      await context.close();
    }

    return allBooks;
  }

  private buildBookResult(book: DiscoveredBook): ScrapeResult {
    const chapters: NcertBookPage['chapters'] = [];

    for (let i = 1; i <= book.maxChapters; i++) {
      const chNum = String(i).padStart(2, '0');
      chapters.push({
        number: i,
        name: `Chapter ${i}`,
        url: `${PDF_BASE}/${book.bookCode}${chNum}.pdf`,
      });
    }

    const classLevel = this.parseClassLevel(book.classValue);
    const subject = this.detectSubject(
      book.bookTitle,
      book.subjectText,
      book.language,
    );

    return {
      success: true,
      bookCode: book.bookCode,
      title: book.bookTitle,
      class: classLevel,
      subject:
        book.language === 'hindi'
          ? this.detectSubjectHindi(book.bookTitle)
          : subject,
      language: book.language,
      chaptersScraped: chapters.length,
      chaptersDownloaded: 0,
      errors: [],
      duration: 0,
      chapters,
    };
  }

  private extractBookCode(bookUrlValue: string): string {
    const match = bookUrlValue.match(/\?([a-z]+\d+)=/i);
    if (match?.[1]) {
      return match[1];
    }
    return bookUrlValue.replace(/[^a-z0-9]/gi, '');
  }

  private extractMaxChapters(bookUrlValue: string): number {
    const match = bookUrlValue.match(/=(\d+)-(\d+)/);
    if (match?.[2]) {
      return Number.parseInt(match[2], 10);
    }
    const match2 = bookUrlValue.match(/-(\d+)$/);
    if (match2?.[1]) {
      return Number.parseInt(match2[1], 10);
    }
    return 15;
  }

  private parseClassLevel(classValue: string): GradeLevel {
    return CLASS_VALUE_MAP[classValue] ?? 'class-1';
  }

  private detectSubject(
    title: string,
    subjectText: string,
    language: Language,
  ): Subject {
    const lower = title.toLowerCase();
    for (const [key, value] of Object.entries(SUBJECT_MAP)) {
      if (lower.includes(key)) return value;
    }

    const subjectLower = subjectText.toLowerCase();
    for (const [key, value] of Object.entries(SUBJECT_MAP)) {
      if (subjectLower.includes(key)) return value;
    }

    if (language === 'hindi') {
      for (const [key, value] of Object.entries(HINDI_SUBJECT_MAP)) {
        if (lower.includes(key)) return value;
      }
    }

    return 'other';
  }

  private detectSubjectHindi(title: string): Subject {
    const lower = title.toLowerCase();
    for (const [key, value] of Object.entries(HINDI_SUBJECT_MAP)) {
      if (lower.includes(key)) return value;
    }
    return 'other';
  }

  async getBookChapterUrls(
    _classValue: string,
    _subjectValue: string,
    bookCode: string,
    _ln: string,
  ): Promise<ChapterInfo[]> {
    const chapters: ChapterInfo[] = [];
    for (let i = 1; i <= 20; i++) {
      const chNum = String(i).padStart(2, '0');
      chapters.push({
        number: i,
        name: `Chapter ${i}`,
        url: `${PDF_BASE}/${bookCode}${chNum}.pdf`,
      });
    }
    return chapters;
  }
}
