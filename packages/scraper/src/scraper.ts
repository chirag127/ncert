import type {
  ChapterInfo,
  GradeLevel,
  Language,
  Subject as SubjectType,
} from '@ncert-library/types';
import * as cheerio from 'cheerio';
import { type Browser, chromium } from 'playwright';
import type { NcertBookPage, ScrapeOptions, ScrapeResult } from './types.js';

const NCERT_BASE = 'https://ncert.nic.in';
const TEXTBOOK_URL = `${NCERT_BASE}/textbook.php`;

const SUBJECT_MAP: Record<string, SubjectType> = {
  mathematics: 'mathematics',
  math: 'mathematics',
  maths: 'mathematics',
  science: 'science',
  'social science': 'social-science',
  social: 'social-science',
  english: 'english',
  hindi: 'hindi',
  'hindi language': 'hindi',
  sanskrit: 'sanskrit',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  history: 'history',
  geography: 'geography',
  'political science': 'political-science',
  'political theory': 'political-theory',
  economics: 'economics',
  accountancy: 'accountancy',
  'business studies': 'business-studies',
  'informatics practices': 'informatics-practices',
  'computer science': 'computer-science',
  psychology: 'psychology',
  sociology: 'sociology',
  philosophy: 'philosophy',
  'heritage crafts': 'heritage-crafts',
  'fine arts': 'fine-arts',
  'graphic design': 'graphic-design',
  music: 'music',
  dance: 'dance',
  'physical education': 'physical-education',
  'health and physical education': 'health-and-physical-education',
  'environmental studies': 'environmental-studies',
  'general knowledge': 'general-knowledge',
  'value education': 'value-education',
  'work experience': 'work-experience',
  'art education': 'art-education',
  urdu: 'urdu',
};

export class NcertScraper {
  private browser: Browser | null = null;
  private options: ScrapeOptions;

  constructor(options: Partial<ScrapeOptions> = {}) {
    this.options = {
      outputDir: options.outputDir ?? './data/chapters',
      headless: options.headless ?? true,
      concurrency: options.concurrency ?? 3,
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
    const results: ScrapeResult[] = [];

    const classCodes = await this.getClassCodes();
    for (const classCode of classCodes) {
      const subjects = await this.getSubjectsForClass(classCode);
      for (const subject of subjects) {
        const books = await this.getBooksForSubject(classCode, subject.value);
        for (const book of books) {
          try {
            const result = await this.scrapeBook(
              classCode,
              subject.value,
              book.value,
            );
            results.push(result);
          } catch (error) {
            console.error(`Failed to scrape book ${book.text}:`, error);
          }
        }
      }
    }

    return results;
  }

  private async getClassCodes(): Promise<string[]> {
    const page = await this.browser!.newPage();
    try {
      await page.goto(TEXTBOOK_URL, { waitUntil: 'networkidle' });
      await page.waitForSelector('select[name="aerd1"]', { timeout: 10000 });
      const codes = await page.evaluate(() => {
        const select = document.querySelector('select[name="aerd1"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .filter((o) => o.value && o.value !== '..')
          .map((o) => o.value);
      });
      return codes;
    } finally {
      await page.close();
    }
  }

  private async getSubjectsForClass(
    classCode: string,
  ): Promise<Array<{ value: string; text: string }>> {
    const page = await this.browser!.newPage();
    try {
      await page.goto(`${TEXTBOOK_URL}?aerd1=${classCode}`, {
        waitUntil: 'networkidle',
      });
      await page.waitForTimeout(1000);
      const subjects = await page.evaluate(() => {
        const select = document.querySelector('select[name="aerd2"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .filter((o) => o.value && o.value !== '..')
          .map((o) => ({ value: o.value, text: o.textContent?.trim() ?? '' }));
      });
      return subjects;
    } finally {
      await page.close();
    }
  }

  private async getBooksForSubject(
    classCode: string,
    subjectCode: string,
  ): Promise<Array<{ value: string; text: string }>> {
    const page = await this.browser!.newPage();
    try {
      await page.goto(
        `${TEXTBOOK_URL}?aerd1=${classCode}&aerd2=${subjectCode}`,
        {
          waitUntil: 'networkidle',
        },
      );
      await page.waitForTimeout(1000);
      const books = await page.evaluate(() => {
        const select = document.querySelector('select[name="aerd3"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .filter((o) => o.value && o.value !== '..')
          .map((o) => ({ value: o.value, text: o.textContent?.trim() ?? '' }));
      });
      return books;
    } finally {
      await page.close();
    }
  }

  async scrapeBook(
    classCode: string,
    subjectCode: string,
    bookCode: string,
  ): Promise<ScrapeResult> {
    const startTime = Date.now();
    const page = await this.browser!.newPage();
    const errors: string[] = [];

    try {
      const url = `${TEXTBOOK_URL}?aerd1=${classCode}&aerd2=${subjectCode}&aerd3=${bookCode}`;
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout,
      });
      await page.waitForTimeout(2000);

      const html = await page.content();
      const bookData = await this.parseBookPage(html, classCode);

      const classLevel = this.parseClassLevel(classCode);
      const subject = this.parseSubject(bookData.title, classCode, subjectCode);
      const lang: Language = this.detectLanguage(classCode);

      const chaptersDownloaded = this.options.skipDownload
        ? 0
        : await this.downloadChapters(bookData.chapters, bookCode);

      return {
        success: true,
        bookCode,
        title: bookData.title,
        class: classLevel,
        subject,
        language: lang,
        chaptersScraped: bookData.chapters.length,
        chaptersDownloaded,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
      return {
        success: false,
        bookCode,
        title: '',
        class: 'class-1' as GradeLevel,
        subject: 'other' as SubjectType,
        language: 'english' as Language,
        chaptersScraped: 0,
        chaptersDownloaded: 0,
        errors,
        duration: Date.now() - startTime,
      };
    } finally {
      await page.close();
    }
  }

  private async parseBookPage(
    html: string,
    _classCode: string,
  ): Promise<NcertBookPage> {
    const $ = cheerio.load(html);
    const chapters: NcertBookPage['chapters'] = [];
    let title = '';

    const contentDiv = $('.content_main, #content, main').first();
    title =
      contentDiv.find('h1').first().text().trim() ??
      $('title').text().replace('NCERT', '').trim() ??
      '';

    const downloadLink = $('a[href*="download"]').first().attr('href');
    const downloadUrl = downloadLink
      ? downloadLink.startsWith('http')
        ? downloadLink
        : `${NCERT_BASE}/${downloadLink.replace(/^\//, '')}`
      : undefined;

    const coverImg = $('img.cover, img[alt*="cover"], img[src*="cover"]')
      .first()
      .attr('src');
    const coverImage = coverImg
      ? coverImg.startsWith('http')
        ? coverImg
        : `${NCERT_BASE}/${coverImg.replace(/^\//, '')}`
      : undefined;

    let chapterIndex = 0;
    $(
      'a[href*="chapter"], a[href*="gesc"], a[href*="hesc"], a[href*="aesc"], a[href*="fesc"], a[href*="iesc"], a[href*="kefa"], a[href*="lemo"], a[href*="meps"], a[href*="nepa"], a[href*="pepa"], a[href*="qesc"], a[href*="resc"], a[href*="sesc"], a[href*="t esc"], a[href*="uesc"], a[href*="vesc"], a[href*="wesc"]',
    ).each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (
        href &&
        text &&
        !text.toLowerCase().includes('rationalised') &&
        !text.toLowerCase().includes('prelims')
      ) {
        const url = href.startsWith('http')
          ? href
          : `${NCERT_BASE}/${href.replace(/^\//, '')}`;
        chapterIndex++;
        chapters.push({
          name: text,
          url,
          number: chapterIndex,
        });
      }
    });

    return { title, chapters, coverImage, downloadUrl };
  }

  private async downloadChapters(
    chapters: Array<{ name: string; url: string; number: number }>,
    _bookCode: string,
  ): Promise<number> {
    let downloaded = 0;
    for (const chapter of chapters) {
      try {
        const response = await fetch(chapter.url);
        if (response.ok) {
          downloaded++;
        }
      } catch {
        // Chapter download failed
      }
    }
    return downloaded;
  }

  private parseClassLevel(classCode: string): GradeLevel {
    const num = Number.parseInt(classCode.split('-')[0] ?? '1');
    const map: Record<number, GradeLevel> = {
      0: 'balvatika-1',
      1: 'class-1',
      2: 'class-2',
      3: 'class-3',
      4: 'class-4',
      5: 'class-5',
      6: 'class-6',
      7: 'class-7',
      8: 'class-8',
      9: 'class-9',
      10: 'class-10',
      11: 'class-11',
      12: 'class-12',
    };
    return map[num] ?? 'class-1';
  }

  private parseSubject(
    title: string,
    _classCode: string,
    _subjectCode: string,
  ): SubjectType {
    void _classCode;
    void _subjectCode;
    const lower = title.toLowerCase();
    for (const [key, value] of Object.entries(SUBJECT_MAP)) {
      if (lower.includes(key)) return value;
    }
    return 'other';
  }

  private detectLanguage(_classCode: string): Language {
    return 'english';
  }

  async getBookChapterUrls(
    classCode: string,
    subjectCode: string,
    _bookCode: string,
  ): Promise<ChapterInfo[]> {
    const page = await this.browser!.newPage();
    try {
      const url = `${TEXTBOOK_URL}?aerd1=${classCode}&aerd2=${subjectCode}&aerd3=${_bookCode}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const html = await page.content();
      const bookData = await this.parseBookPage(html, classCode);
      return bookData.chapters.map((ch, i) => ({
        number: i + 1,
        name: ch.name,
        url: ch.url,
      }));
    } finally {
      await page.close();
    }
  }
}
