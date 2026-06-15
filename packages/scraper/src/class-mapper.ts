import type { GradeLevel } from '@ncert-library/types';

const CLASS_MAP: Record<number, GradeLevel> = {
  1: 'class-1',
  2: 'class-2',
  3: 'class-3',
  4: 'class-4',
  5: 'class-5',
  6: 'class-6',
  7: 'class-7',
  8: 'class-8',
  9: 'class-9',
  10: 'class-10',
  11: 'class-11',
  12: 'class-12',
};

const NCERT_CLASS_CODES: Record<GradeLevel, number> = {
  'balvatika-1': 0,
  'balvatika-2': 0,
  'balvatika-3': 0,
  'class-1': 1,
  'class-2': 2,
  'class-3': 3,
  'class-4': 4,
  'class-5': 5,
  'class-6': 6,
  'class-7': 7,
  'class-8': 8,
  'class-9': 9,
  'class-10': 10,
  'class-11': 11,
  'class-12': 12,
};

const DISPLAY_NAMES: Record<GradeLevel, string> = {
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

export class NcertClassMapper {
  static fromNcertDropdown(text: string): GradeLevel | null {
    const cleaned = text.trim().toLowerCase();
    if (cleaned.includes('balvatika') || cleaned.includes('bal vatika')) {
      if (cleaned.includes('i') || cleaned.includes('1')) return 'balvatika-1';
      if (cleaned.includes('ii') || cleaned.includes('2')) return 'balvatika-2';
      if (cleaned.includes('iii') || cleaned.includes('3'))
        return 'balvatika-3';
      return 'balvatika-1';
    }
    const match = cleaned.match(/class\s*([\d]+|[ivxlcdm]+)/i);
    if (!match) return null;
    const romanMap: Record<string, number> = {
      i: 1,
      ii: 2,
      iii: 3,
      iv: 4,
      v: 5,
      vi: 6,
      vii: 7,
      viii: 8,
      ix: 9,
      x: 10,
      xi: 11,
      xii: 12,
    };
    const num =
      romanMap[match[1]?.toLowerCase() ?? ''] ??
      Number.parseInt(match[1] ?? '0');
    return CLASS_MAP[num] ?? null;
  }

  static toNcertCode(grade: GradeLevel): number {
    return NCERT_CLASS_CODES[grade] ?? 0;
  }

  static toDisplayName(grade: GradeLevel): string {
    return DISPLAY_NAMES[grade] ?? grade;
  }

  static getOrder(grade: GradeLevel): number {
    const order: Record<GradeLevel, number> = {
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
    return order[grade] ?? 99;
  }
}
