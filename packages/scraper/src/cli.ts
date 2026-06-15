import { NcertScraper } from './scraper.js';

async function main() {
  const scraper = new NcertScraper({
    outputDir: process.env.OUTPUT_DIR ?? './data/chapters',
    headless: true,
    concurrency: 3,
  });

  try {
    await scraper.initialize();
    const results = await scraper.scrapeAllBooks();
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await scraper.destroy();
  }
}

main().catch(console.error);
