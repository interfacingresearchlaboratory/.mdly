# Setup Guide

## 1. What This Repository Is

This is a **Turborepo monorepo** that contains:

- **`apps/web`**: A Next.js application that serves as the main web interface
- **`apps/docs`**: A Next.js documentation site
- **`packages/ui`**: A shared React component library used by both apps
- **`packages/backend`**: A Convex backend package that provides the database and serverless functions

The project uses:
- **Turborepo** for monorepo management and build orchestration
- **Next.js 16** for the web applications
- **Convex** as the backend-as-a-service (BaaS) for real-time database and serverless functions
- **TypeScript** throughout
- **pnpm** as the package manager

The web app is already configured to connect to Convex via the `ConvexClientProvider` component, but you'll need to set up your Convex project and configure authentication before it's fully functional.

## 2. What You Need to Change in Convex

### Initial Convex Setup

1. **Install Convex CLI** (if not already installed):
   ```bash
   npm install -g convex
   ```

2. **Navigate to the backend package**:
   ```bash
   cd packages/backend
   ```

3. **Initialize Convex** (if not already done):
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project (or link to an existing one)
   - Generate a deployment URL
   - Start the Convex development server

4. **Get your Convex deployment URL**:
   After running `npx convex dev`, you'll receive a deployment URL that looks like:
   ```
   https://your-project.convex.cloud
   ```

5. **Set the environment variable**:
   Create a `.env.local` file in `apps/web/` (or add to your existing `.env.local`):
   ```bash
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   ```

### Create Your Convex Functions

Currently, the Convex backend has no functions defined. You need to create your own functions in `packages/backend/convex/`.

**Example: Create a simple query function**

Create `packages/backend/convex/example.ts`:
```typescript
import { query } from "./_generated/server";

export const getExample = query({
  handler: async (ctx) => {
    // Your query logic here
    return { message: "Hello from Convex!" };
  },
});
```

**Example: Create a mutation function**

Add to `packages/backend/convex/example.ts`:
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createExample = mutation({
  args: {
    data: v.string(),
  },
  handler: async (ctx, args) => {
    // Your mutation logic here
    // Example: await ctx.db.insert("examples", { data: args.data });
    return { success: true };
  },
});
```

### Define Your Database Schema

Convex uses TypeScript types to define your database schema. You can define tables by creating files in `packages/backend/convex/` that export schema definitions, or define them through the Convex dashboard.

**Example schema definition** (`packages/backend/convex/schema.ts`):
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  examples: defineTable({
    data: v.string(),
    createdAt: v.number(),
  }),
});
```

### Running Convex Development

- **Development mode**: Run `npx convex dev` in `packages/backend/` to start the Convex development server
- **Deploy**: Run `npx convex deploy` to deploy your functions to production
- **Dashboard**: Visit your Convex dashboard at `https://dashboard.convex.dev` to view your data and functions

## 3. Authentication Setup

This repository uses **Clerk** for authentication with **Convex**. The app is already wired for Clerk; you only need to complete the manual configuration below.

#### Manual steps

**1. Clerk Dashboard**

- Sign up or log in at [clerk.com](https://clerk.com) and create an application.
- Go to **API Keys** and copy:
  - **Publishable key** → use as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - **Secret key** → use as `CLERK_SECRET_KEY`
- Go to **JWT Templates**:
  - Click **New template** and choose the **Convex** template.
  - **Do not rename it** – the name must stay `convex`.
  - Copy the **Issuer** URL (your Clerk Frontend API URL, e.g. `https://xxx.clerk.accounts.dev`) – you will need it for Convex.

**2. Convex Dashboard**

- Open [dashboard.convex.dev](https://dashboard.convex.dev), select your project.
- Go to **Settings** → **Environment Variables**.
- Add:
  - **`CLERK_JWT_ISSUER_DOMAIN`** = the Issuer URL from the Clerk “convex” JWT template (step 1).
  - **`CLERK_WEBHOOK_SYNC_SECRET`** = a secret you generate (e.g. run `openssl rand -hex 32`) in terminal. Use the **same** value in the Next.js app in step 4.

**3. Sync Convex**
In terminal
- From the repo root: `cd packages/backend && npx convex dev` (run at least once so `auth.config.ts` and `http.ts` are pushed and env vars are applied).

or 'run pnpm dev' (this does all above) inside the backend folder

**4. Next.js environment variables**

- In `apps/web/.env.local`, set (see `apps/web/.env.example` for reference):
  - `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL (e.g. `https://xxx.convex.cloud`).
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = Clerk publishable key.
  - `CLERK_SECRET_KEY` = Clerk secret key.
  - `CLERK_WEBHOOK_SYNC_SECRET` = the **same** value you set in the Convex dashboard (step 2).
- After adding the webhook in step 5, add:
  - `CLERK_WEBHOOK_SIGNING_SECRET` = the **Signing secret** Clerk shows for that webhook.

**5. Clerk webhook (user sync)**

- In Clerk Dashboard go to **Webhooks** → **Add endpoint**.
- **Endpoint URL**: `https://<your-app-domain>/api/webhooks/clerk` (for local dev you can use e.g. `https://localhost:3000/api/webhooks/clerk`; for production use your real domain).
- Subscribe to **`user.created`** and **`user.updated`**.
- After saving, open the endpoint and copy the **Signing secret** → set as `CLERK_WEBHOOK_SIGNING_SECRET` in `apps/web/.env.local` (step 4).

**6. Run the app**

- From the repo root: `pnpm dev` (and keep `npx convex dev` running in `packages/backend` when developing).

### Authentication in Your Functions

Access the authenticated user in your Convex functions with `ctx.auth.getUserIdentity()`:

```typescript
import { query } from "./_generated/server";

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    // identity.subject is the Clerk user ID
    return await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("id", identity.subject))
      .first();
  },
});
```

### Environment Variables for Auth

- **Next.js** (`apps/web/.env.local`): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `CLERK_WEBHOOK_SYNC_SECRET`, and `NEXT_PUBLIC_CONVEX_URL`.
- **Convex Dashboard** (Settings → Environment Variables): `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_WEBHOOK_SYNC_SECRET` (same value as in Next.js).

Set Convex-only secrets in the Convex dashboard; set Next.js env vars in `apps/web/.env.local`.

## 4. Integrations (Notion and Linear)

The app can connect to Notion and Linear via OAuth. Users connect in **Settings → Integrations** after you configure the keys below.

### Notion

1. **Create a public integration** at [notion.so/profile/integrations](https://www.notion.so/profile/integrations) (or **My integrations** in Notion).
2. **Configure OAuth**: In the integration’s OAuth / redirect settings, add a redirect URI:
   - `{NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`
   - For local dev, e.g. `http://localhost:3000/api/integrations/notion/callback`
3. **Copy credentials** into `apps/web/.env.local`:
   - **Client ID** → `NEXT_PUBLIC_NOTION_CLIENT_ID`
   - **Client Secret** → `NOTION_CLIENT_SECRET`

### Linear

1. **Create an OAuth application** at [linear.app/settings/api/applications/new](https://linear.app/settings/api/applications/new).
2. **Add redirect URI**:
   - `{NEXT_PUBLIC_APP_URL}/api/integrations/linear/callback`
   - For local dev, e.g. `http://localhost:3000/api/integrations/linear/callback`
3. **Copy credentials** into `apps/web/.env.local`:
   - **Client ID** → `NEXT_PUBLIC_LINEAR_CLIENT_ID`
   - **Client Secret** → `LINEAR_CLIENT_SECRET`

Ensure `NEXT_PUBLIC_APP_URL` is set in `apps/web/.env.local` (e.g. `http://localhost:3000` for dev) so OAuth redirects work.

## Quick Start Checklist

- [ ] Install dependencies: `pnpm install`
- [ ] Set up Convex project: `cd packages/backend && npx convex dev`
- [ ] Copy deployment URL to `apps/web/.env.local` as `NEXT_PUBLIC_CONVEX_URL`
- [ ] Complete Clerk + Convex auth (see manual steps above): Clerk app, JWT template named `convex`, Convex env vars, `apps/web/.env.local`, Clerk webhook
- [ ] Run Convex dev at least once: `cd packages/backend && npx convex dev`
- [ ] Start the development server: `pnpm dev` (from root) or `pnpm dev --filter=web`
- [ ] Optional: Configure Notion/Linear keys (see Integrations section) and connect in Settings → Integrations

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Guide](https://docs.convex.dev/auth)
- [Turborepo Documentation](https://turborepo.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
