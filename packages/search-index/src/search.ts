import type { SearchDocument } from '@ncert-library/types';
import type { SearchResult } from './types.js';

export function createSearch(documents: SearchDocument[]) {
  return {
    search(query: string, options: SearchOptions = {}): SearchResult[] {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      if (terms.length === 0) return [];

      const results: Array<SearchResult & { _score: number }> = [];

      for (const doc of documents) {
        let score = 0;
        let matchField: string | undefined;
        let matchText: string | undefined;

        for (const term of terms) {
          // Title match (highest weight)
          if (doc.title.toLowerCase().includes(term)) {
            score += 10;
            matchField = 'title';
            matchText = doc.title;
          }

          // Subject match
          if (doc.subject.toLowerCase().includes(term)) {
            score += 8;
            if (!matchField) {
              matchField = 'subject';
              matchText = doc.subject;
            }
          }

          // Class match
          if (doc.className.toLowerCase().includes(term)) {
            score += 6;
            if (!matchField) {
              matchField = 'class';
              matchText = doc.className;
            }
          }

          // Keyword match
          for (const kw of doc.keywords) {
            if (kw.toLowerCase().includes(term)) {
              score += 5;
              if (!matchField) {
                matchField = 'keyword';
                matchText = kw;
              }
            }
          }

          // Chapter name match
          for (const ch of doc.chapterNames) {
            if (ch.toLowerCase().includes(term)) {
              score += 3;
              if (!matchField) {
                matchField = 'chapter';
                matchText = ch;
              }
            }
          }

          // Description match
          if (doc.description.toLowerCase().includes(term)) {
            score += 2;
            if (!matchField) {
              matchField = 'description';
              matchText = doc.description.slice(0, 100);
            }
          }

          // Tag match
          for (const tag of doc.tags) {
            if (tag.toLowerCase().includes(term)) {
              score += 4;
              if (!matchField) {
                matchField = 'tag';
                matchText = tag;
              }
            }
          }
        }

        if (score > 0) {
          results.push({
            bookCode: doc.bookCode,
            title: doc.title,
            className: doc.className,
            subject: doc.subject,
            language: doc.language,
            score,
            matchField,
            matchText,
            _score: score,
          });
        }
      }

      const { limit = 20, offset = 0, sortBy } = options;

      if (sortBy === 'title') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        results.sort((a, b) => b._score - a._score);
      }

      return results.slice(offset, offset + limit);
    },
  };
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'title';
  filters?: {
    classes?: string[];
    subjects?: string[];
    languages?: string[];
    editions?: number[];
  };
}
