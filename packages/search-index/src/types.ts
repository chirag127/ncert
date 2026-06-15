export interface SearchConfig {
  dataDir: string;
  outputDir: string;
}

export interface SearchResult {
  bookCode: string;
  title: string;
  className: string;
  subject: string;
  language: string;
  score: number;
  matchField?: string;
  matchText?: string;
}
