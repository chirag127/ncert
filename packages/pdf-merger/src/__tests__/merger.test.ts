import { describe, expect, it } from 'vitest';
import { PdfMerger } from '../merger.js';

describe('PdfMerger', () => {
  it('should create instance', () => {
    const merger = new PdfMerger();
    expect(merger).toBeInstanceOf(PdfMerger);
  });

  it('should handle empty chapter list gracefully', async () => {
    const merger = new PdfMerger();
    const result = await merger.mergeBook({
      chaptersDir: '/tmp/nonexistent',
      outputDir: '/tmp/output',
      bookCode: 'test-book',
      title: 'Test Book',
      chapterFiles: [],
    });

    expect(result.success).toBe(true);
    expect(result.chaptersMerged).toBe(0);
    expect(result.pageCount).toBe(1); // TOC page
  });
});
