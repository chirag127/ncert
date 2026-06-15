import type { SearchDocument } from '@ncert-library/types';
import { describe, expect, it } from 'vitest';
import { createSearch } from '../search.js';

describe('Search', () => {
  const documents: SearchDocument[] = [
    {
      id: '101-mathematics',
      bookCode: '101-mathematics',
      title: 'Mathematics Textbook for Class I',
      subject: 'mathematics',
      className: 'class-1',
      language: 'english',
      keywords: ['mathematics', 'numbers', 'class 1', 'ncert'],
      chapterNames: ['Chapter 1: Numbers', 'Chapter 2: Addition'],
      description: 'NCERT Class I Mathematics textbook',
      tags: ['class-1', 'mathematics', 'english'],
      editionYear: 2024,
    },
    {
      id: '201-science',
      bookCode: '201-science',
      title: 'Science Textbook for Class II',
      subject: 'science',
      className: 'class-2',
      language: 'english',
      keywords: ['science', 'plants', 'animals', 'ncert'],
      chapterNames: ['Chapter 1: Plants', 'Chapter 2: Animals'],
      description: 'NCERT Class II Science textbook',
      tags: ['class-2', 'science', 'english'],
      editionYear: 2024,
    },
  ];

  it('should return results for matching query', () => {
    const search = createSearch(documents);
    const results = search.search('mathematics');

    expect(results).toHaveLength(1);
    expect(results[0]?.bookCode).toBe('101-mathematics');
  });

  it('should return multiple results for broad query', () => {
    const search = createSearch(documents);
    const results = search.search('ncert');

    expect(results).toHaveLength(2);
  });

  it('should return empty array for non-matching query', () => {
    const search = createSearch(documents);
    const results = search.search('xyzzy');

    expect(results).toHaveLength(0);
  });

  it('should sort by relevance by default', () => {
    const search = createSearch(documents);
    const results = search.search('class');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.score).toBeGreaterThanOrEqual(results[1]?.score ?? 0);
  });

  it('should respect limit option', () => {
    const search = createSearch(documents);
    const results = search.search('ncert', { limit: 1 });

    expect(results).toHaveLength(1);
  });
});
