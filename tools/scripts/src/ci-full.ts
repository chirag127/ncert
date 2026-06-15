/**
 * Full CI pipeline script.
 * Runs scrape -> merge -> metadata -> search-index in sequence.
 */

const EXEC = (cmd: string) =>
  new Promise<void>((resolve, reject) => {
    const { execSync } = require('child_process');
    try {
      execSync(cmd, { stdio: 'inherit', shell: true });
      resolve();
    } catch (error) {
      reject(error);
    }
  });

async function main() {
  const steps = [
    { name: 'Scraping NCERT', cmd: 'pnpm scrape' },
    { name: 'Merging PDFs', cmd: 'pnpm merge:pdfs' },
    { name: 'Generating metadata', cmd: 'pnpm generate:metadata' },
    { name: 'Generating search index', cmd: 'pnpm generate:search' },
    { name: 'Building website', cmd: 'pnpm build:website' },
  ];

  for (const step of steps) {
    console.log(`\n=== ${step.name} ===`);
    try {
      await EXEC(step.cmd);
      console.log(`✓ ${step.name} completed`);
    } catch (error) {
      console.error(`✗ ${step.name} failed:`, error);
      process.exit(1);
    }
  }

  console.log('\n✓ Full CI pipeline completed successfully');
}

main();
