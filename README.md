# Oriz NCERT

[![GitHub stars](https://img.shields.io/github/stars/chirag127/ncert-app?style=social)](https://github.com/chirag127/ncert-app/stargazers)

> Free NCERT textbook directory — browse, search, and download every NCERT book by class, subject, and language.

**Live at**: <https://books.oriz.in> · **Status**: production

## What this is

A searchable catalogue of the full NCERT textbook list. Chapter and whole-book PDFs are linked directly to `ncert.nic.in` — nothing is hosted here. Optional sign-in lets readers bookmark books across the `*.oriz.in` family.

## Per-feature inventory

| Feature | Status |
| --- | --- |
| Book catalogue (`/`) | ✅ live |
| Per-book detail pages (`book/[bookCode]`) | ✅ live |
| Search (`/search`) | ✅ live |
| Account / sign-in (shared) | ✅ live |
| Legal pages | ✅ live |
| Bookmarks synced to Firestore | 🚧 WIP |
| In-repo scraper for metadata refresh | 📜 planned |

## App-specific env vars

None beyond the family-wide set at `templates/.env.example`.

## Local dev

```bash
# from the workspace root (c:/D/oriz)
pnpm -F @chirag127/oriz-books dev
```

## Knowledge

See [`./knowledge/`](./knowledge/) for app-specific decisions, runbooks, and services. Family rules / decisions / architecture live at the master repo's [`knowledge/`](../../../../knowledge/).

## License

MIT License. See master [`LICENSE`](../../../../LICENSE) — same terms across the family.
