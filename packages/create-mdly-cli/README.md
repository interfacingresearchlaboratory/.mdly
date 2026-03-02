# create-mdly-cli

Internal CLI to copy mdly editor source into another repo.

## Usage

```bash
node packages/create-mdly-cli/bin/create-mdly-cli.js init
```

From within this monorepo:

```bash
pnpm --filter create-mdly-cli start -- init --target /path/to/other-repo
```

Options:
- `--target <path>` target repo root (default `.`)
- `--dest <path>` destination folder in target repo (default `src/mdly`)
- `--force` overwrite existing destination
