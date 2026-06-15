import { SearchIndexBuilder } from './builder.js';

async function main() {
  const metadataDir = process.env.METADATA_DIR ?? './data/metadata';
  const outputDir = process.env.OUTPUT_DIR ?? './data/search-index';

  const builder = new SearchIndexBuilder(outputDir);
  const result = await builder.buildFromMetadata(metadataDir);

  console.log(
    `Search index built: ${result.totalDocuments} documents, ${result.totalKeywords} keywords, ${result.totalSuggestions} suggestions`,
  );
}

main().catch(console.error);
