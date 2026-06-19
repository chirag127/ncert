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
  // Try the scraper's actual output location first (data/metadata/books.json),
  // then fall back to the legacy `scraped-books.json` for older pipelines.
  const candidates = [
    join(dataDir, 'metadata', 'books.json'),
    join(dataDir, 'scraped-books.json'),
  ];
  for (const path of candidates) {
    try {
      const data = await readFile(path, 'utf-8');
      console.log(`Loaded scraped data from ${path}`);
      return JSON.parse(data);
    } catch {
      // try next candidate
    }
  }
  console.warn('No scraped data found, using empty dataset');
  return [];
}

main().catch(console.error);
