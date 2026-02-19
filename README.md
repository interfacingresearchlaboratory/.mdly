# Landing app

The marketing and legal site for **mdly**, the open source project. A Next.js app that shares one design system and one editor stack with the rest of the product—so you ship one brand, one codebase, and one stack to maintain.

---

## Pain point

Marketing sites often drift from the product: a different design system, a separate “landing” stack, or content locked in a CMS. You end up maintaining two UIs, two themes, and two ways to change copy—or betting on a custom editor that’s hard to upgrade or hand off.

## Use mdly

Use mdly when you want one design system and one stack for both product and marketing, so your landing looks like your app, stays in sync with it, and runs on a stack you can maintain and explain.

---

## Why use this

**You should use this landing app if you want:**

- **One design system for product and marketing.** The landing page, legal pages, and the main app all use `@editor/ui` (shadcn + Lexical). No separate “marketing” theme or component set—one Tailwind config, one set of primitives, one place to change the look and feel.
- **A stack that’s built to last.** Lexical (Meta), Tailwind, and the [shadcn-editor](https://github.com/htmujahid/shadcn-editor) lineage are mainstream, well-documented, and actively maintained. You’re not betting on a niche framework or a custom editor fork.
- **Content in Markdown and MDX, not locked in.** The homepage is MDX (components + copy); legal and long-form content are plain Markdown. Authors edit files in `content/`; the app compiles and renders them. No CMS required to get started, and the rendering pipeline is transparent and extensible.
- **A clear place for “read-only” content.** The Lexical editor lives in the main app for editing. The landing app uses the same editor components only where you need demos or mockups; static Markdown is handled by a dedicated renderer so responsibilities stay clear.

**In short:** use this app to run a fast, maintainable marketing site that looks and behaves like your product, on a stack you can explain and hand off.

---

## Quick start

**Run the app** (from repo root):

```bash
pnpm dev --filter=landing
```

Open [http://localhost:3001](http://localhost:3001).

**Run from this app only:**

```bash
cd apps/landing && pnpm dev
```

**Build:**

```bash
turbo build --filter=landing
```

---

## What’s in this app

| What | Where | How it’s rendered |
|------|--------|-------------------|
| **Homepage** | `content/landing.mdx` | Fumadocs MDX → React; custom components via `mdx-components.tsx` |
| **Legal (Privacy, Terms)** | `content/legal/*.md` | Read on the server → `MarkdownRenderer` (react-markdown + Tailwind prose) |
| **Shared UI** | `@editor/ui` | Buttons, accordions, editor mockups, Logo, etc. |

The app runs on **port 3001** and is one of four apps in the mdly Turborepo.

---

## Markdown rendering

The landing app renders read-only content in two ways: **MDX** for the homepage and **plain Markdown** for legal (and any other long-form) content.

### Where Markdown is used

- **MDX (homepage):** `content/landing.mdx` is compiled by Fumadocs MDX and rendered as a React component. Custom blocks (accordions, mockups, CTAs) come from `mdx-components.tsx`.
- **Plain Markdown (legal):** `content/legal/privacy.md` and `content/legal/terms.md` are read from disk and passed to `MarkdownRenderer` on `/privacy` and `/terms`.

### Current implementation

- **Component:** `src/components/markdown-renderer.tsx`
- **Behavior:** `react-markdown` + Tailwind `prose`. External links get `target="_blank"` and `rel="noreferrer"` via a `useEffect`.
- **Gaps:**
  - No **remark-gfm** — Tables, strikethrough, autolinks, and task lists are not parsed (they render wrong or as raw text).
  - No **custom components** — `<pre>` and `<code>` use browser defaults (no syntax highlighting or code-block styling). Blockquotes and tables are only basic prose.

### Direction: fully build out the renderer

Goal: keep the same stack and make the renderer complete.

1. **Parsing:** Add `remark-gfm` so GitHub Flavored Markdown is supported.
2. **Rendering:** Pass a `components` map to `ReactMarkdown` so `code`, `pre`, `blockquote`, `table`, lists, headings, and links use your design system (Tailwind + `@editor/ui` where it fits). Optionally add a rehype-based syntax highlighter for code blocks.
3. **Lexical vs. read-only:** Lexical’s markdown layer is for **editing** (paste, shortcuts). This work is only for **read-only** Markdown on the landing app.

**Files to touch:** `apps/landing/package.json` (add `remark-gfm`), `apps/landing/src/components/markdown-renderer.tsx` (plugins + `components`). Legal pages already use `MarkdownRenderer`; no change needed there.

---

## Technical stack (detailed)

The landing app and the mdly monorepo use a small set of long-term, maintainable technologies. Below is how each layer fits together.

### Monorepo and tooling

| Tool | Role |
|------|------|
| **Turborepo 2** | Task orchestration and caching; run `pnpm dev` or `turbo build --filter=landing` |
| **pnpm 9** | Package manager; `workspace:*` links the landing app to `@editor/ui` |
| **Node.js ≥ 18** | Runtime requirement |
| **TypeScript 5.9** | Typing across the repo |

The landing app follows the same ESLint, Prettier, and TypeScript conventions as the rest of the monorepo.

### Next.js and React

- **Next.js 16 (App Router)** — Routes under `src/app/`; server components by default; client components only where needed (e.g. `MarkdownRenderer`, theme toggle, interactive mockups). Port **3001**.
- **React 19** — Used by the landing app and `@editor/ui`. Server components and modern hooks are available.
- **Config** — `next.config.ts` wraps the default config with Fumadocs MDX via `createMDX()` so `content/*.mdx` (and configured `.md`) are compiled.

Static content (e.g. legal) is read on the server and passed to the client; the homepage is a single compiled MDX component.

### Lexical and the editor

- **Lexical (Meta)** — The editor framework lives in `@editor/ui`. The landing app does **not** run the full editor on the marketing page; it uses **ToolbarlessEditor** and shared primitives only inside mockups and demos.
- **Why Lexical** — Maintainable, extensible (nodes, plugins, commands), and part of the [shadcn-editor](https://github.com/htmujahid/shadcn-editor) lineage. The landing app reuses the same UI and editor components so product and marketing stay in sync.
- **Read-only vs. editing** — Lexical’s markdown is for **editing**. Read-only Markdown (legal, docs) is handled by **react-markdown** and its plugins, not Lexical.

### Tailwind and styling

- **Tailwind CSS 4** — With PostCSS. The landing app extends `@editor/ui/tailwind.config` so colors, spacing, and typography match the product.
- **Prose** — Long-form content uses `prose` / `prose-invert` (and overrides in `MarkdownRenderer` and the homepage container) so headings, paragraphs, and lists stay consistent.
- **Theme** — `next-themes` for light/dark; the app respects system or user preference.

Styling is Tailwind-first; `@editor/ui` supplies the components (buttons, cards, accordions, etc.) already styled to match.

### shadcn/ui, Radix, and @editor/ui

- **shadcn-editor lineage** — This repo is inspired by [htmujahid/shadcn-editor](https://github.com/htmujahid/shadcn-editor): Lexical + shadcn/ui. Here it’s extended to a Turborepo with multiple apps and a shared `@editor/ui` package.
- **Radix UI** — `@editor/ui` is built on Radix primitives (accordion, dialog, popover, select, tabs, tooltip, etc.) and the shadcn pattern: copy-in components, Tailwind, full control over the DOM.
- **Imports** — Path-based: `@editor/ui/button`, `@editor/ui/accordion`, `@editor/ui/editor/toolbarless-editor`, `@editor/ui/utils`, `@editor/ui/colors.css`, `@editor/ui/tailwind.config`. The landing app uses these so the marketing site and the product share one design language.

### Content and MDX (Fumadocs)

- **Fumadocs MDX** — Compiles and loads MDX from `content/`. `next.config.ts` uses `createMDX()` from `fumadocs-mdx/next`.
- **source.config.ts** — Defines `dir: "content"`, frontmatter schema (`title`, optional `description`), and `mdxOptions.providerImportSource: "mdx-components"`. The generated `.source` output is produced from this; authors edit files in `content/`.
- **mdx-components.tsx** — Maps MDX elements to your components (accordions, section breaks, mockups, etc.) so the landing page is interactive and on-brand.
- **Summary:** **MDX** = homepage (component-rich); **plain Markdown** = legal and other read-only content via `MarkdownRenderer`.

### Markdown rendering (react-markdown, remark, rehype)

- **react-markdown 9** — Turns a Markdown string into React nodes. Supports a `components` prop and **remark** (parse) / **rehype** (transform) plugins.
- **Remark** — Adding **remark-gfm** enables tables, task lists, strikethrough, autolinks. Other remark plugins can be added as needed.
- **Rehype** — Optional plugins (e.g. rehype-highlight or Shiki) for syntax-highlighted code blocks or sanitization.
- **Current gap** — The renderer is minimal (no GFM, no custom components). Building it out means adding `remark-gfm`, a `components` map, and optionally one rehype plugin for code.

Read-only Markdown stays on the standard react-markdown + remark + rehype stack; Lexical stays focused on editing.

### Other dependencies

- **@xyflow/react** — Diagram/flow mockups.
- **recharts** — Charts in marketing or demo sections.
- **lucide-react, react-icons** — Icons.
- **nextjs-toploader** — Loading indicator on navigation.
- **@dnd-kit/** — Drag-and-drop for interactive mockups (e.g. kanban).

These are app-level; the core architecture is Next.js + React + Tailwind + Lexical + @editor/ui + Fumadocs + react-markdown.

---

## Learn more

- [mdly README](../../README.md) — Overview of all apps and packages.
- [shadcn-editor](https://github.com/htmujahid/shadcn-editor) — Upstream Lexical + shadcn/ui editor.
- [Lexical](https://lexical.dev/) — The editor framework.
- [Fumadocs](https://fumadocs.dev/) — MDX and docs tooling.
