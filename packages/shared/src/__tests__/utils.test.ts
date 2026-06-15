import { describe, expect, it } from 'vitest';
import { cn } from '../cn.js';
import { urlUtils } from '../url-utils.js';

describe('cn', () => {
  it('should join class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('should filter falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it('should return empty string for no args', () => {
    expect(cn()).toBe('');
  });
});

describe('urlUtils', () => {
  it('should validate URLs', () => {
    expect(urlUtils.isValidUrl('https://example.com')).toBe(true);
    expect(urlUtils.isValidUrl('not-a-url')).toBe(false);
  });

  it('should normalize URLs with base', () => {
    expect(urlUtils.normalizeUrl('https://base.com', '/path')).toBe(
      'https://base.com/path',
    );
    expect(urlUtils.normalizeUrl('https://base.com/', '/path')).toBe(
      'https://base.com/path',
    );
  });
});
