export interface MetadataConfig {
  dataDir: string;
  firebaseProjectId?: string;
  firebaseCredentialsPath?: string;
}

export interface GenerateResult {
  totalBooks: number;
  totalClasses: number;
  totalSubjects: number;
  totalLanguages: number;
  outputPaths: string[];
}
