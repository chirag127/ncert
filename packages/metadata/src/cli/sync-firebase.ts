import { FirebaseSyncer } from '../firebase-syncer.js';

async function main() {
  const dataDir = process.env.DATA_DIR ?? './data';
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const dryRun = process.env.DRY_RUN === 'true';

  if (!projectId) {
    console.error('FIREBASE_PROJECT_ID environment variable is required');
    process.exit(1);
  }

  const syncer = new FirebaseSyncer(
    dataDir,
    {
      projectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(
        /\\n/g,
        '\n',
      ),
    },
    dryRun,
  );

  const report = await syncer.syncAll();
  console.log(JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
