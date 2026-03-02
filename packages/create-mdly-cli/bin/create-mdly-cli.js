#!/usr/bin/env node

import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HELP = `create-mdly-cli

Usage:
  create-mdly-cli init [--target <path>] [--dest <path>] [--force]
  create-mdly-cli upgrade [--target <path>] [--dest <path>] [--force]

Options:
  --target <path>   Target project root (default: current directory)
  --dest <path>     Destination folder in target (default: src/mdly)
  --force           Overwrite existing files in destination
  -h, --help        Show help
`;

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    target: ".",
    dest: "src/mdly",
    force: false,
  };

  let command = "init";
  if (args[0] && !args[0].startsWith("-")) {
    command = args.shift();
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--") {
      continue;
    }
    if (arg === "--target") {
      options.target = args[i + 1] ?? ".";
      i += 1;
      continue;
    }
    if (arg === "--dest") {
      options.dest = args[i + 1] ?? "src/mdly";
      i += 1;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      command = "help";
      continue;
    }
    console.error(`Unknown option: ${arg}`);
    process.exit(1);
  }

  return { command, options };
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readMdlyVersion(repoRoot) {
  const pkgPath = path.join(repoRoot, "packages", "mdly", "package.json");
  const raw = await readFile(pkgPath, "utf8");
  const parsed = JSON.parse(raw);
  return parsed.version ?? "0.0.0";
}

async function writeManifest(targetRoot, destDir, version) {
  const manifestPath = path.join(targetRoot, "mdly.local.json");
  const manifest = {
    schemaVersion: 1,
    copiedFrom: "packages/mdly/src",
    destination: path.relative(targetRoot, destDir),
    mdlyVersion: version,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function runCopy({ target, dest, force }) {
  const repoRoot = path.resolve(__dirname, "..", "..", "..");
  const sourceDir = path.join(repoRoot, "packages", "mdly", "src");

  if (!(await exists(sourceDir))) {
    console.error(`Could not find source directory: ${sourceDir}`);
    console.error("Run this CLI from the editor repo checkout or adjust the package layout.");
    process.exit(1);
  }

  const targetRoot = path.resolve(process.cwd(), target);
  const destDir = path.resolve(targetRoot, dest);

  const destExists = await exists(destDir);
  if (destExists && !force) {
    console.error(`Destination already exists: ${destDir}`);
    console.error("Re-run with --force to overwrite.");
    process.exit(1);
  }

  await mkdir(path.dirname(destDir), { recursive: true });
  await cp(sourceDir, destDir, {
    recursive: true,
    force,
    errorOnExist: !force,
  });

  const mdlyVersion = await readMdlyVersion(repoRoot);
  await writeManifest(targetRoot, destDir, mdlyVersion);

  console.log(`Copied mdly source to: ${destDir}`);
  console.log(`Wrote manifest: ${path.join(targetRoot, "mdly.local.json")}`);
  console.log("\nNext steps:");
  console.log(`1. Add \`${path.relative(targetRoot, destDir)}/**/*.{ts,tsx}\` to Tailwind scan/source config.`);
  console.log(`2. Import \`${path.relative(targetRoot, path.join(destDir, "editor", "themes", "editor-theme.css"))}\` from your app entry/layout.`);
  console.log("3. Import editor components from the copied folder in your app code.");
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));

  if (command === "help") {
    console.log(HELP);
    return;
  }

  if (command !== "init" && command !== "upgrade") {
    console.error(`Unknown command: ${command}`);
    console.log(HELP);
    process.exit(1);
  }

  await runCopy(options);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
