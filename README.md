# Editor

Shadcn implementation of the [Lexical](https://lexical.dev/) rich text editor in a [Turborepo](https://turborepo.dev/) monorepo. Inspired by [htmujahid/shadcn-editor](https://github.com/htmujahid/shadcn-editor) · [Demo](https://shadcn-editor.vercel.app)

## What's inside?

This monorepo includes:

### Apps

- **`apps/web`** – Next.js (App Router), main web app, port 3000
- **`apps/landing`** – Next.js landing, port 3001
- **`apps/docs`** – Next.js docs (Fumadocs), port 3002
- **`apps/changelog`** – Next.js changelog, port 3003

### Packages

- **`@editor/ui`** – Shared React component library with the Lexical-based rich text editor (shadcn/ui, Radix, Tailwind)
- **`@editor/eslint-config`** – Shared ESLint configs (Next.js, React, Turbo)
- **`@editor/typescript-config`** – Shared `tsconfig` bases (Next.js, React library)

Everything is written in [TypeScript](https://www.typescriptlang.org/).

## Core stack

| Layer        | Technology |
| ------------ | ---------- |
| **Runtime**  | [Node.js](https://nodejs.org/) ≥ 18 |
| **Package manager** | [pnpm](https://pnpm.io/) 9 |
| **Monorepo** | [Turborepo](https://turborepo.dev/) 2 |
| **Frontend** | [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19 |
| **Editor**   | [Lexical](https://lexical.dev/) with [shadcn/ui](https://ui.shadcn.com/) |
| **Styling**  | [Tailwind CSS](https://tailwindcss.com/) 4, [Shadcn UI](https://ui.shadcn.com/) / Radix UI |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.9 |

### Development

- [ESLint](https://eslint.org/) (shared config in `@editor/eslint-config`)
- [Prettier](https://prettier.io) for formatting

## Quick start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Run the app**
   ```bash
   pnpm dev
   ```

   To run a single app: `pnpm dev --filter=web` (or `landing`, `docs`, `changelog`).

## Build

```bash
turbo build
# or
pnpm exec turbo build
```

Build a single app or package with a filter:

```bash
turbo build --filter=web
pnpm exec turbo build --filter=web
```

## Develop

```bash
turbo dev
# or
pnpm exec turbo dev
```

With a filter:

```bash
turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

## Remote caching

Turborepo can use [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) (e.g. [Vercel](https://vercel.com)) to share build caches:

```bash
turbo login
turbo link
```

## Useful links

- [Turborepo docs](https://turborepo.dev/docs) – tasks, caching, filters, config
- [shadcn-editor](https://github.com/htmujahid/shadcn-editor) – upstream Lexical + shadcn/ui editor
- [Lexical](https://lexical.dev/) – framework for building editors
- [Next.js docs](https://nextjs.org/docs)
