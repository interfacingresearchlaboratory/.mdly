# Setup Guide

## 1. What This Repository Is

This is a **Turborepo monorepo** that contains:

- **`apps/web`**: A Next.js application that serves as the main web interface (editor demo)
- **`packages/ui`**: A shared React component library with the Lexical-based editor used by the web app
- **`packages/typescript-config`**: Shared TypeScript configuration
- **`packages/eslint-config`**: Shared ESLint configuration

The project uses:
- **Turborepo** for monorepo management and build orchestration
- **Next.js 16** for the web application
- **TypeScript** throughout
- **pnpm** as the package manager

## 2. Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start the development server**:
   ```bash
   pnpm dev
   ```
   This runs the web app at [http://localhost:3000](http://localhost:3000).

## 3. Available Scripts

From the repo root:

- **`pnpm dev`** — Start the web app in development mode
- **`pnpm build`** — Build all packages and the web app
- **`pnpm lint`** — Run ESLint across the monorepo
- **`pnpm check-types`** — Run TypeScript type checking
- **`pnpm format`** — Format code with Prettier

## 4. Optional: Environment Variables

For local development the app works without environment variables. If you need to customize the app URL (e.g. for OAuth or webhooks), create `apps/web/.env.local` and set:

- **`NEXT_PUBLIC_APP_URL`** — Base URL of the app (e.g. `http://localhost:3000` for dev)

## Additional Resources

- [Turborepo Documentation](https://turborepo.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Lexical Documentation](https://lexical.dev)
