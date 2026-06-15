export type GradeLevel =
  | 'balvatika-1'
  | 'balvatika-2'
  | 'balvatika-3'
  | 'class-1'
  | 'class-2'
  | 'class-3'
  | 'class-4'
  | 'class-5'
  | 'class-6'
  | 'class-7'
  | 'class-8'
  | 'class-9'
  | 'class-10'
  | 'class-11'
  | 'class-12';

export type Language = 'english' | 'hindi';

export type Subject =
  | 'mathematics'
  | 'science'
  | 'social-science'
  | 'english'
  | 'hindi'
  | 'sanskrit'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'political-science'
  | 'economics'
  | 'accountancy'
  | 'business-studies'
  | 'informatics-practices'
  | 'computer-science'
  | 'psychology'
  | 'sociology'
  | 'philosophy'
  | 'political-theory'
  | 'heritage-crafts'
  | 'fine-arts'
  | 'graphic-design'
  | 'music'
  | 'dance'
  | 'physical-education'
  | 'health-and-physical-education'
  | 'environmental-studies'
  | 'general-knowledge'
  | 'value-education'
  | 'work-experience'
  | 'art-education'
  | 'urdu'
  | 'other';

export interface ChapterInfo {
  number: number;
  name: string;
  url: string;
  pageCount?: number;
}

export interface BookMetadata {
  bookCode: string;
  class: GradeLevel;
  subject: Subject;
  language: Language;
  title: string;
  subtitle?: string;
  editionYear: number;
  numberOfChapters: number;
  chapterNames: string[];
  chapterUrls: string[];
  chapters: ChapterInfo[];
  coverImage?: string;
  pageCount?: number;
  fileSize?: number;
  sha256?: string;
  tags: string[];
  keywords: string[];
  description: string;
  ncertClassCode?: number;
  ncertBookCode?: number;
  lastUpdated?: string;
  isRationalised?: boolean;
  downloadUrl?: string;
}

export interface ClassGroup {
  class: GradeLevel;
  displayName: string;
  displayOrder: number;
  books: string[];
}

export interface SubjectGroup {
  subject: Subject;
  displayName: string;
  displayOrder: number;
  books: string[];
}

export interface LanguageGroup {
  language: Language;
  displayName: string;
  books: string[];
}

export interface SearchDocument {
  id: string;
  bookCode: string;
  title: string;
  subject: string;
  className: string;
  language: string;
  keywords: string[];
  chapterNames: string[];
  description: string;
  tags: string[];
  editionYear: number;
}

export interface SearchIndex {
  version: number;
  generatedAt: string;
  totalBooks: number;
  documents: SearchDocument[];
}

export interface WebsiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteLogo: string;
  socialLinks: {
    github: string;
    twitter?: string;
  };
  features: {
    pwa: boolean;
    offlineSupport: boolean;
    darkMode: boolean;
    search: boolean;
    bookmarks: boolean;
    readingProgress: boolean;
    keyboardShortcuts: boolean;
    commandPalette: boolean;
  };
  seo: {
    ogImage: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
  };
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface FilterState {
  classes: GradeLevel[];
  subjects: Subject[];
  languages: Language[];
  editions: number[];
  tags: string[];
  keywords: string[];
  bookCodes: string[];
  searchQuery: string;
  sortBy: 'title' | 'class' | 'subject' | 'edition' | 'relevance';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface BookProgress {
  bookCode: string;
  currentChapter: number;
  totalChapters: number;
  progressPercent: number;
  lastReadAt: string;
}

export interface Bookmark {
  bookCode: string;
  chapterIndex: number;
  chapterName: string;
  note?: string;
  createdAt: string;
}

export type ExportFormat =
  | 'json'
  | 'csv'
  | 'yaml'
  | 'markdown'
  | 'xml'
  | 'opds';

export interface ScrapedPage {
  classCode: string;
  bookCode: string;
  title: string;
  chapters: Array<{
    name: string;
    url: string;
    number: number;
  }>;
  language: string;
  subject: string;
  coverImage?: string;
  downloadUrl?: string;
}
