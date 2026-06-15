export interface MergeOptions {
  chaptersDir: string;
  outputDir: string;
  bookCode: string;
  title: string;
  chapterFiles: string[];
  addCoverPage?: boolean;
  coverImage?: string;
  addTableOfContents?: boolean;
  compress?: boolean;
}

export interface MergeResult {
  success: boolean;
  bookCode: string;
  outputPath: string;
  pageCount: number;
  fileSize: number;
  chaptersMerged: number;
  duration: number;
  error?: string;
}
