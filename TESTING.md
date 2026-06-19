# TESTING.md

How we test this project, and which Claude Code skills are useful for which checks.

## Test layers

| Layer | Tool | Where | Run with |
|---|---|---|---|
| Unit (TS) | Vitest | `packages/*/**.test.ts` | `pnpm test` |
| E2E (browser) | Playwright | `apps/website/e2e/*.spec.ts` | `pnpm --filter=@ncert-library/website exec playwright test` |
| Linting | Biome | repo-wide | `pnpm lint` / `pnpm lint:fix` |
| Typecheck | tsc + astro check | repo-wide | `pnpm typecheck` (currently fails workspace-wide — see CLAUDE.md, pre-existing) |
| Production build | Astro | `apps/website` | `pnpm build:website` |

## Running the e2e suite

The Playwright config in `apps/website/playwright.config.ts` auto-spawns `pnpm dev` if no server is on port 4321 and re-uses an existing one if there is. So you can just run:

```bash
cd apps/website
pnpm exec playwright test                 # all suites
pnpm exec playwright test download.spec   # one file
pnpm exec playwright test --headed        # see the browser
pnpm exec playwright test --ui            # interactive UI
```

First run on a fresh checkout: `pnpm exec playwright install chromium` to fetch the browser binary.

## What the e2e suite covers today

- `home.spec.ts` — homepage loads, search input visible, navigation, dark-mode class on `<html>`.
- `download.spec.ts` — **regression test** for the "Download whole book" + per-chapter download buttons. Asserts:
  - The buttons are real `<a>` elements (not `<button onClick>`) — the previous bug was a JS click handler that did a CORS-blocked client-side merge.
  - `href` ends in `.pdf` and points at `ncert.nic.in`.
  - `download` attribute is set so the browser saves rather than navigates.
  - `target="_blank"` and `rel` includes `noopener`.
  - Clicking the full-book button does not produce console errors matching `merge|pdf-lib|Failed to (load chapter|fetch)`.

The download spec depends on the seed book `hemh1` being present in `apps/website/public/data/metadata/books.json`. If that ever rotates out, edit `SEED_BOOK_CODE` in the spec.

## How to dogfood the site by hand

Skill priority — pick the first one that's actually working on your machine:

1. **`agent-browser`** (preferred where it works). Install: `npm i -g agent-browser && agent-browser install`. Drives Chrome via CDP with accessibility-tree snapshots — cheaper context than Playwright. Note: errors `EPERM` on Windows here (Node 24, npm-installed binary). Works fine on macOS/Linux.
2. **`playwright-e2e` skill** + a one-shot `.spec.ts` file. Slower but always works. Lean on this when agent-browser is broken (i.e., on this Windows machine).
3. **`verify` skill** if you just want a one-shot "does the change actually work" pass.

For the **download flow specifically**, the live test is:
- Start `pnpm --filter=@ncert-library/website dev`.
- Open `http://localhost:4321/book/hemh1`.
- Open DevTools → Network. Click "Download Full Book (PDF)". The browser should issue ONE request to `https://ncert.nic.in/textbook/pdf/hemh1.pdf` and start a save dialog. No `Failed to fetch`, no `Merge error` in the console.
- Click any chapter "Download" button. Same pattern — one request, one save dialog.

If you see the OLD behaviour (button is a `<button>`, lots of `Failed to fetch chapter N` warnings, possible empty PDF), the fix did not deploy.

## Scraper testing

The scraper hits live `ncert.nic.in`, takes 1–3 hours, and is rate-limited by the upstream site. Don't run it in unit tests.

- Smoke test: `pnpm scrape` with `OUTPUT_DIR=./tmp-scrape`, then check `tmp-scrape/scrape-stats.json` — non-zero `total`, `successful`, and presence of `english` AND `hindi` in `byLanguage`.
- Sanity check the output: `cat tmp-scrape/metadata/books.json | jq '[.[] | .language] | group_by(.) | map({k: .[0], n: length})'` should show both languages.
- The `data/metadata/books.json` shipped in the repo is **seed data** (8 hardcoded English books, classes 9-12). It exists so the website renders something on first checkout. Do not treat it as the scraper's actual output.

## Skills used in this project's history

- `agent-browser` (described above) — preferred for live UI repro on macOS/Linux.
- `playwright-e2e` — for adding regression tests; current download-button fix uses this.
- `verify` — for "does the change actually work in the running app".
- `code-review` / `simplify` — for hygiene passes after a fix lands.
- `Explore` agent — used during the 2026-06 audit to map the scraper → metadata → website pipeline and pinpoint the seam bug.

## Common failure modes

- **`pnpm dev` won't start** — port 4321 already taken; `lsof -i :4321` (mac/linux) or `Get-NetTCPConnection -LocalPort 4321` (Windows PowerShell), kill the offending process.
- **Playwright tests pass locally, fail in CI** — CI uses `retries: 2` and `workers: 1`; flake usually means a slow Astro cold-start. Bump `webServer.timeout` in `playwright.config.ts`.
- **`pnpm typecheck` errors** — pre-existing on `main` (~130 errors from React components using `class=` instead of `className=`). Filter by your file to see if you actually broke anything: `pnpm typecheck 2>&1 | grep YourFile`.
- **`agent-browser` errors `EPERM` on spawn** — Windows + Node 24 issue. Use Playwright instead.
