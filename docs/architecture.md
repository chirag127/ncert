# Architecture

## Overview

NCERT Library is a fully static digital library platform built as a Turborepo monorepo. The entire pipeline runs on GitHub Actions with zero recurring infrastructure costs.

## Data Flow

```
NCERT Website
    │
    ▼
[Playwright Scraper]
    │ Downloads chapters as PDFs
    ▼
[Chapter PDFs] ──► [PDF Merger] ──► [Merged Textbook PDFs]
    │
    ▼
[Metadata Generator] ──► [JSON Metadata Files]
    │                         │
    │                         ├── books.json
    │                         ├── classes/
    │                         ├── subjects/
    │                         ├── languages/
    │                         └── bookcodes/
    │
    ▼
[Search Index Builder] ──► [FlexSearch Indexes]
    │                         │
    │                         ├── documents.json
    │                         ├── titles.json
    │                         ├── keywords.json
    │                         └── suggestions.json
    │
    ▼
[Firebase Sync] ──► [Firestore Database]
    │
    ▼
[Astro Build] ──► [Static Site] ──► [GitHub Pages / CDN]
```

## Key Decisions

### Why Static?
- Zero server costs
- Maximum performance
- Perfect CDN caching
- No database queries at runtime
- GitHub Pages hosts for free

### Why Firebase?
- Structured queries for the API
- Real-time updates when needed
- Scales to zero when unused
- Free tier sufficient for dataset size

### Why Turborepo?
- Efficient monorepo management
- Cached builds across packages
- Parallel task execution
- Fine-grained dependency graph

### Why Playwright + Cheerio?
- Playwright handles dynamic dropdowns on NCERT site
- Cheerio for static HTML parsing of loaded pages
- Trade memory for correctness with dynamic content

## Directory Structure Details

```
packages/
├── types/           # All TypeScript interfaces and types
├── scraper/         # NCERT website scraping logic
│   ├── scraper.ts   # Main scraper with Playwright
│   ├── class-mapper.ts
│   └── chapter-downloader.ts
├── metadata/        # Metadata generation
│   ├── generator.ts
│   ├── writer.ts    # JSON file writing
│   └── firebase-syncer.ts
├── pdf-merger/      # PDF merging with pdf-lib
│   └── merger.ts
├── search-index/    # Search index building
│   ├── builder.ts   # Prebuilt index generation
│   └── search.ts    # Client-side search implementation
├── shared/          # Shared utilities
└── api-client/      # Client-side data fetching
```

## Performance Targets

- Lighthouse score: >95
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Bundle size: <200KB initial
