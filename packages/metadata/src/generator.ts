import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  BookMetadata,
  ChapterInfo,
  ClassGroup,
  GradeLevel,
  Language,
  LanguageGroup,
  Subject,
  SubjectGroup,
} from '@ncert-library/types';

export class MetadataGenerator {
  private dataDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  async generateAll(
    scrapedData: ScrapedBookData[],
  ): Promise<GeneratedMetadata> {
    const books: BookMetadata[] = [];
    const classGroups = new Map<string, ClassGroup>();
    const subjectGroups = new Map<string, SubjectGroup>();
    const languageGroups = new Map<string, LanguageGroup>();
    const bookCodeIndex = new Map<string, BookMetadata>();

    for (const data of scrapedData) {
      const metadata = this.buildMetadata(data);
      books.push(metadata);

      // Class index
      const classKey = data.class;
      if (!classGroups.has(classKey)) {
        classGroups.set(classKey, {
          class: data.class,
          displayName: this.classDisplayName(data.class),
          displayOrder: this.classOrder(data.class),
          books: [],
        });
      }
      classGroups.get(classKey)!.books.push(data.bookCode);

      // Subject index
      const subjectKey = data.subject;
      if (!subjectGroups.has(subjectKey)) {
        subjectGroups.set(subjectKey, {
          subject: data.subject,
          displayName: this.subjectDisplayName(data.subject),
          displayOrder: 0,
          books: [],
        });
      }
      subjectGroups.get(subjectKey)!.books.push(data.bookCode);

      // Language index
      const langKey = data.language;
      if (!languageGroups.has(langKey)) {
        languageGroups.set(langKey, {
          language: data.language,
          displayName: data.language === 'english' ? 'English' : 'Hindi',
          books: [],
        });
      }
      languageGroups.get(langKey)!.books.push(data.bookCode);

      // Book code index
      bookCodeIndex.set(data.bookCode, metadata);
    }

    return {
      books,
      classGroups: Array.from(classGroups.values()),
      subjectGroups: Array.from(subjectGroups.values()),
      languageGroups: Array.from(languageGroups.values()),
      bookCodeIndex,
    };
  }

  async writeAll(generated: GeneratedMetadata): Promise<string[]> {
    const paths: string[] = [];
    const metaDir = join(this.dataDir, 'metadata');
    await mkdir(metaDir, { recursive: true });

    // Write books.json
    const booksPath = join(metaDir, 'books.json');
    await writeFile(booksPath, JSON.stringify(generated.books, null, 2));
    paths.push(booksPath);

    // Write class indexes
    for (const group of generated.classGroups) {
      const dir = join(metaDir, 'classes');
      await mkdir(dir, { recursive: true });
      const path = join(dir, `${group.class}.json`);
      await writeFile(path, JSON.stringify(group, null, 2));
      paths.push(path);
    }

    // Write subject indexes
    for (const group of generated.subjectGroups) {
      const dir = join(metaDir, 'subjects');
      await mkdir(dir, { recursive: true });
      const path = join(dir, `${group.subject}.json`);
      await writeFile(path, JSON.stringify(group, null, 2));
      paths.push(path);
    }

    // Write language indexes
    for (const group of generated.languageGroups) {
      const dir = join(metaDir, 'languages');
      await mkdir(dir, { recursive: true });
      const path = join(dir, `${group.language}.json`);
      await writeFile(path, JSON.stringify(group, null, 2));
      paths.push(path);
    }

    // Write book code indexes
    for (const [code, metadata] of generated.bookCodeIndex) {
      const dir = join(metaDir, 'bookcodes');
      await mkdir(dir, { recursive: true });
      const path = join(dir, `${code}.json`);
      await writeFile(path, JSON.stringify(metadata, null, 2));
      paths.push(path);
    }

    return paths;
  }

  private buildMetadata(data: ScrapedBookData): BookMetadata {
    return {
      bookCode: data.bookCode,
      class: data.class,
      subject: data.subject,
      language: data.language,
      title: data.title,
      subtitle: data.subtitle,
      editionYear: data.editionYear ?? new Date().getFullYear(),
      numberOfChapters: data.chapters.length,
      chapterNames: data.chapters.map((c) => c.name),
      chapterUrls: data.chapters.map((c) => c.url),
      chapters: data.chapters,
      coverImage: data.coverImage,
      pageCount: data.pageCount,
      fileSize: data.fileSize,
      sha256: data.sha256,
      tags: this.generateTags(data),
      keywords: this.generateKeywords(data),
      description: this.generateDescription(data),
      lastUpdated: new Date().toISOString(),
      isRationalised: data.isRationalised,
    };
  }

  private generateTags(data: ScrapedBookData): string[] {
    const tags: string[] = [data.class, data.subject, data.language];
    if (data.editionYear) tags.push(`edition-${data.editionYear}`);
    return tags;
  }

  private generateKeywords(data: ScrapedBookData): string[] {
    const keywords = [
      data.title,
      ...data.title.split(' '),
      this.classDisplayName(data.class),
      this.subjectDisplayName(data.subject),
      data.language,
      ...data.chapters.map((c) => c.name),
    ];
    return [...new Set(keywords.map((k) => k.toLowerCase()))];
  }

  private generateDescription(data: ScrapedBookData): string {
    const classStr = this.classDisplayName(data.class);
    const subjectStr = this.subjectDisplayName(data.subject);
    return `${data.title} - NCERT ${classStr} ${subjectStr} textbook (${data.language} edition). Contains ${data.chapters.length} chapters.`;
  }

  private classDisplayName(cls: GradeLevel): string {
    const map: Record<string, string> = {
      'balvatika-1': 'Balvatika I',
      'balvatika-2': 'Balvatika II',
      'balvatika-3': 'Balvatika III',
      'class-1': 'Class I',
      'class-2': 'Class II',
      'class-3': 'Class III',
      'class-4': 'Class IV',
      'class-5': 'Class V',
      'class-6': 'Class VI',
      'class-7': 'Class VII',
      'class-8': 'Class VIII',
      'class-9': 'Class IX',
      'class-10': 'Class X',
      'class-11': 'Class XI',
      'class-12': 'Class XII',
    };
    return map[cls] ?? cls;
  }

  private classOrder(cls: GradeLevel): number {
    const order: Record<string, number> = {
      'balvatika-1': 0,
      'balvatika-2': 1,
      'balvatika-3': 2,
      'class-1': 3,
      'class-2': 4,
      'class-3': 5,
      'class-4': 6,
      'class-5': 7,
      'class-6': 8,
      'class-7': 9,
      'class-8': 10,
      'class-9': 11,
      'class-10': 12,
      'class-11': 13,
      'class-12': 14,
    };
    return order[cls] ?? 99;
  }

  private subjectDisplayName(subj: Subject): string {
    const map: Record<string, string> = {
      mathematics: 'Mathematics',
      science: 'Science',
      'social-science': 'Social Science',
      english: 'English',
      hindi: 'Hindi',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      history: 'History',
      geography: 'Geography',
      'political-science': 'Political Science',
      economics: 'Economics',
      sanskrit: 'Sanskrit',
    };
    return map[subj] ?? subj;
  }
}

interface ScrapedBookData {
  bookCode: string;
  class: GradeLevel;
  subject: Subject;
  language: Language;
  title: string;
  subtitle?: string;
  editionYear?: number;
  chapters: ChapterInfo[];
  coverImage?: string;
  pageCount?: number;
  fileSize?: number;
  sha256?: string;
  isRationalised?: boolean;
}

export interface GeneratedMetadata {
  books: BookMetadata[];
  classGroups: ClassGroup[];
  subjectGroups: SubjectGroup[];
  languageGroups: LanguageGroup[];
  bookCodeIndex: Map<string, BookMetadata>;
}
