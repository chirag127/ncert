import { MetadataGenerator } from '../generator.js';
import { MetadataWriter } from '../writer.js';

async function main() {
  const dataDir = process.env.DATA_DIR ?? './data';
  const generator = new MetadataGenerator(dataDir);
  const writer = new MetadataWriter(dataDir);

  const scrapedData = await loadScrapedData(dataDir);
  const generated = await generator.generateAll(scrapedData);

  await generator.writeAll(generated);
  await writer.writeBooksIndex(generated.books);

  console.log(`Generated metadata for ${generated.books.length} books`);
}

async function loadScrapedData(dataDir: string) {
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  try {
    const data = await readFile(join(dataDir, 'scraped-books.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    console.warn('No scraped data found, using empty dataset');
    return [];
  }
}

main().catch(console.error);
