import type { GradeLevel, Language, Subject } from '@ncert-library/types';

export interface ScrapeOptions {
  outputDir: string;
  headless?: boolean;
  concurrency?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  language?: Language;
  specificBooks?: string[];
  skipDownload?: boolean;
  forceRefresh?: boolean;
}

export interface ScrapeResult {
  success: boolean;
  bookCode: string;
  title: string;
  class: GradeLevel;
  subject: Subject;
  language: Language;
  chaptersScraped: number;
  chaptersDownloaded: number;
  errors: string[];
  duration: number;
}

export interface NcertDropdownOption {
  value: string;
  text: string;
}

export interface NcertBookPage {
  title: string;
  chapters: Array<{
    name: string;
    url: string;
    number: number;
  }>;
  coverImage?: string;
  downloadUrl?: string;
  rationalisedContentUrl?: string;
}
