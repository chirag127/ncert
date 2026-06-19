# CLAUDE.md

Notes for Claude Code (and humans) working in this repo. Concise pointers, not a tutorial.

## What this is

A Turborepo monorepo that scrapes NCERT textbooks, generates static metadata + a search index, and serves them as a fully-static Astro site. There is **no backend** — everything ships as JSON files that the browser loads.

## Where things live

- `apps/website/` — Astro site (React islands, Tailwind v4). Reads `/data/metadata/books.json` at runtime.
- `apps/docs/` — Docs site.
- `packages/scraper/` — Playwright + Cheerio scraper that hits `ncert.nic.in`. CLI: `pnpm scrape`.
- `packages/metadata/` — Reads scraped data, fans it out into per-class / per-subject / per-language indexes.
- `packages/search-index/` — Builds prebuilt FlexSearch indexes the website ships.
- `packages/pdf-merger/` — pdf-lib helpers; not currently used by the website (see "Download flow" below).
- `tools/scripts/` — CI automation.
- `data/` — Generated artefacts (mostly gitignored). The repo currently ships **seed data** here, not real scrape output.

## The data pipeline (and where it has been broken)

```
NCERT site -> scraper -> data/metadata/books.json -> metadata generator -> per-{class,subject,language} JSON
                                                                       -> search-index builder -> /data/search-index/*.json
```

Two seams have caused real problems:

1. **Scraper output vs metadata generator input.** The scraper writes `data/metadata/books.json`. Until 2026-06, the metadata generator was reading `data/scraped-books.json` — a file that does not exist. Even a successful scrape produced no downstream metadata. Fixed in `packages/metadata/src/cli/generate.ts:loadScrapedData`, which now tries the scraper's actual output first and falls back to the legacy filename.
2. **Hindi subject mapping was sparse.** `HINDI_SUBJECT_MAP` in `packages/scraper/src/scraper.ts` had 13 patterns vs 52 for English. Hindi books with subjects outside that 13-entry map silently became `subject: 'other'`. Expanded to ~35 patterns in the same commit.

Before trusting `data/metadata/books.json`, check `packages/scraper/data/scrape-stats.json` — if it's all zeros the scrape never ran.

## Download flow (why "Download whole book" used to fail)

`apps/website/src/components/BookDetail.tsx` previously had a click handler that:

1. Tried to fetch a server-side merged PDF at `/data/merged/<bookCode>.pdf`. That path is never populated — there is no merge step in the deploy pipeline. So this 404'd and fell to step 2.
2. Imported `pdf-lib` and `fetch()`-d each chapter PDF directly from `https://ncert.nic.in/textbook/pdf/...`, then merged them client-side.

Step 2 cannot work in a browser. `ncert.nic.in` does not send `Access-Control-Allow-Origin`, so every fetch was blocked by CORS. The merge loop swallowed each `Failed to fetch` (line 100, `console.warn`) and produced an effectively-empty PDF, or the spinner stuck on the first chapter forever.

**Fix shipped:** the buttons are now plain `<a href={...} download={...} target="_blank" rel="noopener noreferrer">`. The browser handles the download itself, no CORS issue. The full-book button uses the metadata's `book.downloadUrl` (which is `https://ncert.nic.in/textbook/pdf/<bookCode>.pdf`, the merged PDF NCERT itself hosts) and falls back to building that URL from `bookCode` if the field is missing. Per-chapter buttons link directly to `chapter.url`.

If you ever want client-side merging back, you need either (a) a CORS proxy, or (b) a server-side merge step in CI that publishes `/data/merged/<bookCode>.pdf`. Option (b) is the right answer; option (a) is a runtime liability.

## Routes

- `/` — homepage
- `/books` — book grid (the directory `apps/website/src/pages/` contains `books.astro`, plural)
- `/book/<bookCode>` — book detail page (the directory is `book/`, **singular** — easy to get wrong)
- `/search` — search

## Testing

See `TESTING.md`.

## Commands worth knowing

```bash
pnpm dev                         # all apps
pnpm --filter=@ncert-library/website dev    # just the site, port 4321
pnpm build                       # all
pnpm build:website               # just the site
pnpm --filter=@ncert-library/website exec playwright test    # e2e
pnpm scrape                      # run the full NCERT scrape (HOURS, hits live site)
pnpm generate:metadata           # regenerate per-class/subject/language indexes
pnpm generate:search             # rebuild search index
```

`pnpm typecheck` currently fails workspace-wide on `main` with ~130 ts(2322) errors because the React components use Astro-style `class=` instead of `className=`. That's pre-existing; do not assume your change broke it. Run `pnpm typecheck 2>&1 | grep <yourfile>` to isolate.

## Gotchas

- The website reads `/data/metadata/books.json` from `apps/website/public/data/metadata/`. The scraper writes to `data/metadata/books.json` at the repo root. There must be a copy/sync step before deploy (currently manual or via the daily-scrape workflow). Do not assume editing one updates the other.
- `agent-browser` CLI installs on Windows but errors with `EPERM` on spawn (`v24.16.0` Node, on this machine). Use Playwright for live browser testing on Windows; agent-browser is fine on macOS/Linux.
- Don't `pnpm build` thinking it'll regenerate `books.json`. Build is purely site assembly. Data regeneration is `pnpm scrape && pnpm generate:metadata && pnpm generate:search`.

## Recent meaningful changes (2026-06)

- Pipeline seam fix: `packages/metadata/src/cli/generate.ts` reads from `data/metadata/books.json`.
- `HINDI_SUBJECT_MAP` expanded from 13 → ~35 patterns in `packages/scraper/src/scraper.ts`.
- "Download whole book" button rewritten as a plain anchor in `apps/website/src/components/BookDetail.tsx`. Per-chapter download buttons same treatment. CORS-broken `pdf-lib` client-merge path removed.
- E2E regression test added at `apps/website/e2e/download.spec.ts`.
