import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BookMetadata, SearchDocument } from '@ncert-library/types';

export class SearchIndexBuilder {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  async buildFromMetadata(metadataDir: string): Promise<BuildResult> {
    const books = JSON.parse(
      await readFile(join(metadataDir, 'books.json'), 'utf-8'),
    ) as BookMetadata[];

    await mkdir(this.outputDir, { recursive: true });

    // Build search index data
    const documents: SearchDocument[] = books.map((book) => ({
      id: book.bookCode,
      bookCode: book.bookCode,
      title: book.title,
      subject: book.subject,
      className: book.class,
      language: book.language,
      keywords: book.keywords,
      chapterNames: book.chapterNames,
      description: book.description,
      tags: book.tags,
      editionYear: book.editionYear,
    }));

    // Write prebuilt search data as JSON (FlexSearch indexes built client-side)
    // The full document index for client-side FlexSearch
    await writeFile(
      join(this.outputDir, 'documents.json'),
      JSON.stringify(documents),
    );

    // Build title-only index for quick lookup
    const titleIndex = Object.fromEntries(
      documents.map((d) => [
        d.bookCode,
        { title: d.title, className: d.className, subject: d.subject },
      ]),
    );
    await writeFile(
      join(this.outputDir, 'titles.json'),
      JSON.stringify(titleIndex),
    );

    // Build keyword index
    const keywordIndex: Record<string, string[]> = {};
    for (const doc of documents) {
      for (const kw of doc.keywords) {
        const key = kw.toLowerCase();
        if (!keywordIndex[key]) keywordIndex[key] = [];
        keywordIndex[key].push(doc.bookCode);
      }
    }
    await writeFile(
      join(this.outputDir, 'keywords.json'),
      JSON.stringify(keywordIndex),
    );

    // Build suggestion index
    const suggestionIndex = documents.flatMap((d) => [
      d.title,
      d.className,
      d.subject,
      d.language,
      ...d.chapterNames.slice(0, 5),
    ]);
    await writeFile(
      join(this.outputDir, 'suggestions.json'),
      JSON.stringify([...new Set(suggestionIndex)]),
    );

    return {
      totalDocuments: documents.length,
      totalKeywords: Object.keys(keywordIndex).length,
      totalSuggestions: new Set(suggestionIndex).size,
    };
  }
}

export interface BuildResult {
  totalDocuments: number;
  totalKeywords: number;
  totalSuggestions: number;
}
