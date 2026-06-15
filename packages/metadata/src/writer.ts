import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { BookMetadata } from '@ncert-library/types';

export class MetadataWriter {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async writeBookMetadata(metadata: BookMetadata): Promise<string> {
    const dir = join(this.baseDir, 'metadata', 'bookcodes');
    await mkdir(dir, { recursive: true });
    const path = join(dir, `${metadata.bookCode}.json`);
    await writeFile(path, JSON.stringify(metadata, null, 2));
    return path;
  }

  async writeBooksIndex(books: BookMetadata[]): Promise<string> {
    const path = join(this.baseDir, 'metadata', 'books.json');
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(books, null, 2));
    return path;
  }

  async writeExport(
    books: BookMetadata[],
    format: 'json' | 'csv' | 'yaml' | 'markdown' | 'xml' | 'opds',
  ): Promise<string> {
    const dir = join(this.baseDir, 'exports');
    await mkdir(dir, { recursive: true });
    const ext = format === 'markdown' ? 'md' : format;
    const path = join(dir, `books.${ext}`);

    let content: string;
    switch (format) {
      case 'json':
        content = JSON.stringify(books, null, 2);
        break;
      case 'csv':
        content = this.toCsv(books);
        break;
      case 'yaml':
        content = this.toYaml(books);
        break;
      case 'markdown':
        content = this.toMarkdown(books);
        break;
      case 'xml':
        content = this.toXml(books);
        break;
      case 'opds':
        content = this.toOpds(books);
        break;
    }

    await writeFile(path, content);
    return path;
  }

  private toCsv(books: BookMetadata[]): string {
    const headers = [
      'bookCode',
      'class',
      'subject',
      'language',
      'title',
      'editionYear',
      'numberOfChapters',
    ];
    const rows = books.map((b) =>
      headers
        .map((h) =>
          JSON.stringify(
            String((b as unknown as Record<string, unknown>)[h] ?? ''),
          ).replace(/"/g, '""'),
        )
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }

  private toYaml(books: BookMetadata[]): string {
    return books
      .map((b) => {
        const lines = [
          `- bookCode: ${b.bookCode}`,
          `  title: "${b.title}"`,
          `  class: ${b.class}`,
          `  subject: ${b.subject}`,
        ];
        return lines.join('\n');
      })
      .join('\n');
  }

  private toMarkdown(books: BookMetadata[]): string {
    const header =
      '# NCERT Books\n\n| Book Code | Title | Class | Subject | Language | Chapters |\n|-----------|-------|-------|---------|----------|----------|';
    const rows = books.map(
      (b) =>
        `| ${b.bookCode} | ${b.title} | ${b.class} | ${b.subject} | ${b.language} | ${b.numberOfChapters} |`,
    );
    return [header, ...rows].join('\n');
  }

  private toXml(books: BookMetadata[]): string {
    const items = books
      .map(
        (b) =>
          `  <book>\n    <bookCode>${b.bookCode}</bookCode>\n    <title>${this.escapeXml(b.title)}</title>\n    <class>${b.class}</class>\n    <subject>${b.subject}</subject>\n    <language>${b.language}</language>\n    <chapters>${b.numberOfChapters}</chapters>\n  </book>`,
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n${items}\n</catalog>`;
  }

  private toOpds(books: BookMetadata[]): string {
    const entries = books
      .map(
        (b) =>
          `  <entry>\n    <id>urn:uuid:${b.bookCode}</id>\n    <title>${this.escapeXml(b.title)}</title>\n    <updated>${b.lastUpdated ?? new Date().toISOString()}</updated>\n    <category term="${b.subject}" label="${b.subject}"/>\n    <category term="${b.class}" label="${b.class}"/>\n  </entry>`,
      )
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n${entries}\n</feed>`;
  }

  private escapeXml(str: string): string {
    return str.replace(
      /[<>&'"]/g,
      (c) =>
        ({
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          "'": '&apos;',
          '"': '&quot;',
        })[c] ?? c,
    );
  }
}
