import type {
  ChapterInfo,
  GradeLevel,
  Language,
  Subject,
} from '@ncert-library/types';
import { describe, expect, it } from 'vitest';
import { MetadataGenerator } from '../generator.js';

describe('MetadataGenerator', () => {
  const mockChapters: ChapterInfo[] = [
    {
      number: 1,
      name: 'Chapter 1: Numbers',
      url: 'https://example.com/ch1.pdf',
    },
    {
      number: 2,
      name: 'Chapter 2: Algebra',
      url: 'https://example.com/ch2.pdf',
    },
  ];

  const mockData = [
    {
      bookCode: '101-mathematics',
      class: 'class-1' as GradeLevel,
      subject: 'mathematics' as Subject,
      language: 'english' as Language,
      title: 'Mathematics Textbook for Class I',
      chapters: mockChapters,
      editionYear: 2024,
    },
    {
      bookCode: '101-hindi',
      class: 'class-1' as GradeLevel,
      subject: 'hindi' as Subject,
      language: 'hindi' as Language,
      title: 'Hindi Textbook for Class I',
      chapters: mockChapters,
      editionYear: 2024,
    },
  ];

  it('should generate metadata for all books', async () => {
    const generator = new MetadataGenerator('/tmp');
    const result = await generator.generateAll(mockData);

    expect(result.books).toHaveLength(2);
    expect(result.classGroups).toHaveLength(1);
    expect(result.subjectGroups).toHaveLength(2);
    expect(result.languageGroups).toHaveLength(2);
  });

  it('should index books by class', async () => {
    const generator = new MetadataGenerator('/tmp');
    const result = await generator.generateAll(mockData);

    const classGroup = result.classGroups.find((c) => c.class === 'class-1');
    expect(classGroup).toBeDefined();
    expect(classGroup?.books).toHaveLength(2);
  });

  it('should generate keywords from title and chapters', async () => {
    const generator = new MetadataGenerator('/tmp');
    const result = await generator.generateAll(mockData);

    const mathBook = result.books.find((b) => b.bookCode === '101-mathematics');
    expect(mathBook).toBeDefined();
    expect(mathBook?.keywords.length).toBeGreaterThan(0);
    expect(
      mathBook?.keywords.some((k) => k.includes('mathematics')),
    ).toBeTruthy();
  });
});
