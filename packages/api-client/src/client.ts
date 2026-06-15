import type { BookMetadata, FilterState } from '@ncert-library/types';
import type {
  BooksResponse,
  ClientConfig,
  FiltersResponse,
  SearchResponse,
} from './types.js';

export class LibraryClient {
  private config: ClientConfig;
  private booksCache: BookMetadata[] | null = null;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const url = new URL(path, this.config.baseUrl);
    const response = await fetch(url.toString());
    if (!response.ok)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json() as Promise<T>;
  }

  async getBooks(filters?: Partial<FilterState>): Promise<BooksResponse> {
    const books = await this.getAllBooks();
    let filtered = books;

    if (filters) {
      if (filters.classes?.length) {
        filtered = filtered.filter((b) => filters.classes!.includes(b.class));
      }
      if (filters.subjects?.length) {
        filtered = filtered.filter((b) =>
          filters.subjects!.includes(b.subject),
        );
      }
      if (filters.languages?.length) {
        filtered = filtered.filter((b) =>
          filters.languages!.includes(b.language),
        );
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.bookCode.toLowerCase().includes(q) ||
            b.keywords.some((k) => k.toLowerCase().includes(q)),
        );
      }
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return { books: paged, total: filtered.length, page, pageSize };
  }

  async getBook(bookCode: string): Promise<BookMetadata | null> {
    const books = await this.getAllBooks();
    return books.find((b) => b.bookCode === bookCode) ?? null;
  }

  async getFilters(): Promise<FiltersResponse> {
    const books = await this.getAllBooks();
    const classCount = new Map<string, number>();
    const subjectCount = new Map<string, number>();
    const langCount = new Map<string, number>();
    const editions = new Set<number>();
    const tags = new Set<string>();

    for (const book of books) {
      classCount.set(book.class, (classCount.get(book.class) ?? 0) + 1);
      subjectCount.set(book.subject, (subjectCount.get(book.subject) ?? 0) + 1);
      langCount.set(book.language, (langCount.get(book.language) ?? 0) + 1);
      if (book.editionYear) editions.add(book.editionYear);
      for (const tag of book.tags) tags.add(tag);
    }

    return {
      classes: Array.from(classCount.entries()).map(([value, count]) => ({
        value,
        label: value.replace('class-', 'Class ').replace(/-/g, ' '),
        count,
      })),
      subjects: Array.from(subjectCount.entries()).map(([value, count]) => ({
        value,
        label: value
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
      })),
      languages: Array.from(langCount.entries()).map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
      })),
      editions: Array.from(editions).sort(),
      tags: Array.from(tags).sort(),
    };
  }

  async search(query: string): Promise<SearchResponse> {
    const books = await this.getAllBooks();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = books.map((book) => {
      let score = 0;
      if (terms.some((t) => book.title.toLowerCase().includes(t))) score += 10;
      if (terms.some((t) => book.subject.toLowerCase().includes(t))) score += 8;
      if (terms.some((t) => book.class.toLowerCase().includes(t))) score += 6;
      if (terms.some((t) => book.bookCode.toLowerCase().includes(t)))
        score += 5;
      if (
        terms.some((t) =>
          book.keywords.some((k) => k.toLowerCase().includes(t)),
        )
      )
        score += 4;
      if (
        terms.some((t) =>
          book.chapterNames.some((c) => c.toLowerCase().includes(t)),
        )
      )
        score += 3;
      return { book, score };
    });

    const results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((s) => ({
        bookCode: s.book.bookCode,
        title: s.book.title,
        className: s.book.class,
        subject: s.book.subject,
        language: s.book.language,
        score: s.score,
      }));

    return { results, total: results.length, query };
  }

  private async getAllBooks(): Promise<BookMetadata[]> {
    if (this.booksCache) return this.booksCache;
    this.booksCache = await this.fetchJson<BookMetadata[]>(
      this.config.metadataPath ?? '/data/metadata/books.json',
    );
    return this.booksCache;
  }
}
