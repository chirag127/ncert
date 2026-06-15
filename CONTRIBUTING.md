# Contributing

We love contributions! Here's how to get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Build all packages: `pnpm build`
4. Run tests: `pnpm test`

## Code Style

- We use **Biome** for linting and formatting
- Run `pnpm lint:fix` before committing
- TypeScript strict mode is enforced
- No `any` types unless absolutely necessary

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add search filters
fix: correct PDF merger page order
chore: update dependencies
docs: add API documentation
refactor: extract scraper logic
test: add metadata generator tests
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Run `pnpm lint && pnpm typecheck && pnpm test`
5. Create a changeset: `pnpm changeset`
6. Open a pull request

## Adding a New Package

1. Create the package directory in `packages/`
2. Add `package.json` with `@ncert-library/` scope
3. Add `tsconfig.json` extending the root config
4. Export from `src/index.ts`
5. Add to `pnpm-workspace.yaml`
6. Reference in `turbo.json` if needed

## Need Help?

Open an issue or start a discussion on GitHub.
