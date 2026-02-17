# IRL Repo Template

A template repository to start any project for IRL. Use this monorepo as the base for new apps and products.

## What's inside?

This [Turborepo](https://turborepo.dev/) monorepo includes:

### Apps

- **`apps/web`** – Next.js app (App Router), main web interface with Convex and Clerk auth

You can add more apps later (e.g. docs, landing, Electron).

### Packages

- **`@thisweek/ui`** – Shared React component library (Shadcn UI / Radix, Lexical editor, Tailwind)
- **`@thisweek/backend`** – Convex backend (schema, serverless functions, auth)
- **`@thisweek/eslint-config`** – Shared ESLint configs (Next.js, React, Turbo)
- **`@thisweek/typescript-config`** – Shared `tsconfig` bases (Next.js, React library)

Everything is written in [TypeScript](https://www.typescriptlang.org/).

## Core stack

Derived from the workspace `package.json` files:

| Layer        | Technology |
| ------------ | ---------- |
| **Runtime**  | [Node.js](https://nodejs.org/) ≥ 18 |
| **Package manager** | [pnpm](https://pnpm.io/) 9 |
| **Monorepo** | [Turborepo](https://turborepo.dev/) 2 |
| **Frontend** | [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19 |
| **Backend**  | [Convex](https://convex.dev/) (real-time DB + serverless functions) |
| **Auth**     | [Clerk](https://clerk.com/) (in `apps/web`) |
| **Styling**  | [Tailwind CSS](https://tailwindcss.com/) 4, [Shadcn UI](https://ui.shadcn.com/) / Radix UI |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.9 |

### Development

- [ESLint](https://eslint.org/) (shared config in `@thisweek/eslint-config`)
- [Prettier](https://prettier.io) for formatting

For detailed setup (Convex, env vars, etc.), see [SETUP.md](./SETUP.md).

## Quick start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up Convex** (see [SETUP.md](./SETUP.md))
   ```bash
   cd packages/backend
   npx convex dev
   ```

3. **Environment** – Create `apps/web/.env.local` with your Convex deployment URL:
   ```bash
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   ```

4. **Run the app**
   ```bash
   pnpm dev
   ```

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
- [Convex docs](https://docs.convex.dev)
- [Next.js docs](https://nextjs.org/docs)
- [SETUP.md](./SETUP.md) – detailed setup for this repo
