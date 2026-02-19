# .mdly

An open-source rich text editor built on [Lexical](https://lexical.dev/) and [shadcn/ui](https://ui.shadcn.com/). Distraction-free writing with full typography control, slash commands, tables, images, and more.

**[Live demo](https://mdly.interfacingresearchlaboratory.com)** · **[Buy Me a Coffee](https://buymeacoffee.com/irldevs)**

Inspired by [htmujahid/shadcn-editor](https://github.com/htmujahid/shadcn-editor) ([Demo](https://shadcn-editor.vercel.app/)), Mdly extends the original with additional editor plugins, richer block types, and deeper typography and formatting controls. Use it as a starting point, reference, or fork it and make it your own.

Contributions, ideas, and feedback are all welcome — see [Contributing](#contributing).

## Features

- **Distraction-free writing** — Toolbarless editor that stays out of your way. Floating toolbar appears on text selection.
- **Slash commands** — Type `/` to insert headings, lists, tables, images, code blocks, and more.
- **Typography control** — Customize fonts, font weights, and letter spacing per heading and body text.
- **Table of contents** — Auto-generated from your headings, always visible in the sidebar.
- **Rich block types** — Headings, lists (bullet, numbered, checklist), blockquotes, code blocks with syntax highlighting, horizontal rules, tables, images, columns, cards, and more.
- **Dark and light mode** — System-aware theme toggle powered by `next-themes`.
- **Keyboard shortcuts** — Built-in shortcuts directory for fast editing.
- **Drag and drop** — Reorder blocks by dragging.
- **Mentions and autocomplete** — @-mention support with configurable data sources.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Editor framework | [Lexical](https://lexical.dev/) (Meta) |
| UI components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org/) |
| Monorepo | [Turborepo 2](https://turborepo.dev/) + [pnpm 9](https://pnpm.io/) |
| React | [React 19](https://react.dev/) |

## Project structure

```
mdly/
├── apps/
│   └── web/              # Next.js app — the editor interface
├── packages/
│   ├── ui/               # @editor/ui — shared component library (Lexical + shadcn/ui + Radix)
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json
└── package.json
```

### `apps/web`

The main Next.js application. Renders the editor with a table of contents sidebar, typography controls, theme toggle, and keyboard shortcuts panel.

### `packages/ui`

The shared component library (`@editor/ui`). Contains all editor components (nodes, plugins, toolbar, slash commands), plus general UI primitives (buttons, dialogs, popovers, etc.) built on Radix and styled with Tailwind.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) 9

### Installation

```bash
git clone https://github.com/interfacingresearchlaboratory/editor.git
cd editor
pnpm install
```

### Development

```bash
pnpm dev
```

Opens Mdly at [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
```

### Lint and type-check

```bash
pnpm lint
pnpm check-types
```

## Editor plugins

The editor ships with a rich set of Lexical plugins:

| Plugin | Description |
|--------|-------------|
| Slash command menu | Type `/` to insert any block type |
| Floating text format | Bold, italic, underline, code, link on selection |
| Draggable blocks | Drag handles to reorder content |
| Tables | Insert and resize tables with action menus |
| Images | Insert, resize, and drag-drop images |
| Inline images | Images that flow with text |
| Code blocks | Syntax-highlighted code with language picker |
| Columns | Multi-column layouts |
| Links | Auto-link detection and link editing |
| Mentions | @-mention with dropdown suggestions |
| Autocomplete | Inline text completions |
| Placeholders | Styled placeholder text nodes within content |
| Cards | Structured card blocks for callouts and highlights |
| Markdown toggle | Switch between rich text and Markdown source |
| Smart sections | Dropdown collapsible content sections |

## Contributing

This is an open-source project and contributions are very welcome — whether it's bug fixes, new plugins, UI improvements, documentation, or ideas in the issue tracker.

1. Fork the repository
2. Create your feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Run lint and type-check (`pnpm lint && pnpm check-types`)
5. Commit your changes (`git commit -m "Add my feature"`)
6. Push to your branch (`git push origin my-feature`)
7. Open a pull request

Not sure where to start? Open an issue to discuss your idea first, or look for issues tagged **good first issue**.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [shadcn-editor](https://github.com/htmujahid/shadcn-editor) — the upstream Lexical + shadcn/ui editor this project is based on
- [Lexical](https://lexical.dev/) — the extensible text editor framework by Meta
- [shadcn/ui](https://ui.shadcn.com/) — beautifully designed components built on Radix UI
- [Radix UI](https://www.radix-ui.com/) — accessible, unstyled UI primitives
