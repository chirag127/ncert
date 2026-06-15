import { describe, expect, it } from 'vitest';
import { NcertClassMapper } from '../class-mapper.js';

describe('NcertClassMapper', () => {
  it('should parse class from dropdown text', () => {
    expect(NcertClassMapper.fromNcertDropdown('Class I')).toBe('class-1');
    expect(NcertClassMapper.fromNcertDropdown('Class VI')).toBe('class-6');
    expect(NcertClassMapper.fromNcertDropdown('Class XII')).toBe('class-12');
    expect(NcertClassMapper.fromNcertDropdown('Class 1')).toBe('class-1');
  });

  it('should return null for invalid input', () => {
    expect(NcertClassMapper.fromNcertDropdown('..Select Class..')).toBeNull();
    expect(NcertClassMapper.fromNcertDropdown('')).toBeNull();
  });

  it('should convert to NCERT code', () => {
    expect(NcertClassMapper.toNcertCode('class-1')).toBe(1);
    expect(NcertClassMapper.toNcertCode('class-12')).toBe(12);
    expect(NcertClassMapper.toNcertCode('balvatika-1')).toBe(0);
  });

  it('should return display names', () => {
    expect(NcertClassMapper.toDisplayName('class-1')).toBe('Class I');
    expect(NcertClassMapper.toDisplayName('class-10')).toBe('Class X');
  });
});
