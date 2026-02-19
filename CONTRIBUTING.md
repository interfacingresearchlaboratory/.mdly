# Contributing to Mdly

Thanks for contributing. Keep changes focused, documented, and easy to review.

## Development Setup

1. Install prerequisites:
   - Node.js 18+
   - pnpm 9
2. Install dependencies:

```bash
pnpm install
```

3. Start development:

```bash
pnpm dev
```

## Branch and PR Workflow

1. Fork the repository and create a branch from `main`.
2. Use a descriptive branch name, for example:
   - `fix/editor-link-validation`
   - `feat/slash-command-groups`
3. Keep PRs scoped to one change area.
4. Open a PR with:
   - what changed
   - why it changed
   - screenshots/video for UI changes
   - any migration or breaking-change notes

## Quality Gate (Required)

Run these from repo root before opening a PR:

```bash
pnpm lint
pnpm check-types
pnpm build
```

If one command is intentionally skipped, state why in the PR.

## Coding Guidelines

- Use TypeScript and avoid `any` unless unavoidable.
- Prefer small, composable changes over broad rewrites.
- Keep public APIs stable, and document breaking changes.
- Update docs (`README.md`, setup guides, or inline docs) when behavior changes.

## Commit Messages

Use clear commit messages in imperative tense, for example:

- `fix: sanitize invalid editor links`
- `feat: add card block in slash menu`
- `docs: update setup instructions for web app only`

## Reporting Issues

When filing an issue, include:

- expected behavior
- actual behavior
- reproduction steps
- environment (OS, Node version, browser)

## Security

Do not report security vulnerabilities in public issues.
See `SECURITY.md` for the disclosure process.
