import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type {
  BookMetadata,
  ClassGroup,
  LanguageGroup,
  SubjectGroup,
} from '@ncert-library/types';

interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export class FirebaseSyncer {
  private config: FirebaseConfig;
  private dataDir: string;
  private dryRun: boolean;

  constructor(dataDir: string, config: FirebaseConfig, dryRun = false) {
    this.dataDir = dataDir;
    this.config = config;
    this.dryRun = dryRun;
  }

  async syncAll(): Promise<SyncReport> {
    const report: SyncReport = {
      booksUploaded: 0,
      indexesUpdated: 0,
      errors: [],
      dryRun: this.dryRun,
    };

    if (this.dryRun) {
      console.log(
        '[DRY RUN] Would sync metadata to Firebase project:',
        this.config.projectId,
      );
      return report;
    }

    try {
      const { applicationDefault, initializeApp, getApps } = await import(
        'firebase-admin/app'
      );
      const { getFirestore } = await import('firebase-admin/firestore');

      if (getApps().length === 0) {
        initializeApp({
          credential: applicationDefault(),
          projectId: this.config.projectId,
        });
      }

      const db = getFirestore();
      const metaDir = join(this.dataDir, 'metadata');

      // Upload books collection
      const booksData = JSON.parse(
        await readFile(join(metaDir, 'books.json'), 'utf-8'),
      ) as BookMetadata[];
      const batch = db.batch();
      for (const book of booksData) {
        const ref = db.collection('books').doc(book.bookCode);
        batch.set(ref, book, { merge: true });
        report.booksUploaded++;
      }
      await batch.commit();

      // Upload class indexes
      const classesDir = join(metaDir, 'classes');
      const { readdir } = await import('node:fs/promises');
      const classFiles = await readdir(classesDir);
      for (const file of classFiles) {
        const data = JSON.parse(
          await readFile(join(classesDir, file), 'utf-8'),
        ) as ClassGroup;
        await db
          .collection('classes')
          .doc(data.class)
          .set(data, { merge: true });
        report.indexesUpdated++;
      }

      // Upload subject indexes
      const subjectsDir = join(metaDir, 'subjects');
      const subjectFiles = await readdir(subjectsDir);
      for (const file of subjectFiles) {
        const data = JSON.parse(
          await readFile(join(subjectsDir, file), 'utf-8'),
        ) as SubjectGroup;
        await db
          .collection('subjects')
          .doc(data.subject)
          .set(data, { merge: true });
        report.indexesUpdated++;
      }

      // Upload language indexes
      const languagesDir = join(metaDir, 'languages');
      const langFiles = await readdir(languagesDir);
      for (const file of langFiles) {
        const data = JSON.parse(
          await readFile(join(languagesDir, file), 'utf-8'),
        ) as LanguageGroup;
        await db
          .collection('languages')
          .doc(data.language)
          .set(data, { merge: true });
        report.indexesUpdated++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      report.errors.push(message);
      console.error('Firebase sync failed:', message);
    }

    return report;
  }
}

export interface SyncReport {
  booksUploaded: number;
  indexesUpdated: number;
  errors: string[];
  dryRun: boolean;
}
