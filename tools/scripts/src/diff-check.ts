import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const HASH_FILE = '.data-hash';

async function getDataHash(): Promise<string> {
  const hash = createHash('sha256');
  const files: string[] = [];
  await collectFiles('data/metadata', files);

  for (const file of files.sort()) {
    const content = await readFile(file);
    hash.update(file);
    hash.update(content);
  }

  return hash.digest('hex');
}

async function collectFiles(dir: string, results: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, results);
    } else if (entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
}

async function main() {
  const currentHash = await getDataHash();
  let previousHash = '';

  if (existsSync(HASH_FILE)) {
    previousHash = await readFile(HASH_FILE, 'utf-8');
  }

  const hasChanges = currentHash !== previousHash;

  if (hasChanges) {
    await writeFile(HASH_FILE, currentHash);
    console.log('Data changed, proceeding with update');
    process.exit(0);
  } else {
    console.log('No data changes detected, skipping update');
    process.exit(1);
  }
}

main();
