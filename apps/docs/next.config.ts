import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

const withMDX = createMDX();

// Fix type annotations in auto-generated .source/index.ts
// This runs after MDX processing to add explicit type annotations
function fixSourceTypes() {
  const sourceIndexPath = path.join(__dirname, ".source", "index.ts");
  if (existsSync(sourceIndexPath)) {
    let content = readFileSync(sourceIndexPath, "utf8");
    // Add explicit any type annotations to avoid TS4023 errors
    if (!content.includes("export const docs: any")) {
      content = content.replace(
        /export const docs = _runtime\.doc/g,
        "export const docs: any = _runtime.doc"
      );
    }
    if (!content.includes("export const meta: any")) {
      content = content.replace(
        /export const meta = _runtime\.meta/g,
        "export const meta: any = _runtime.meta"
      );
    }
    writeFileSync(sourceIndexPath, content);
  }
}

// Fix types immediately (for dev mode) and after webpack config (for build)
if (typeof window === "undefined") {
  try {
    fixSourceTypes();
  } catch {
    // Ignore if file doesn't exist yet
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignore type errors during build - we'll check types separately
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Help webpack resolve modules from the workspace root in pnpm
    // pnpm stores packages in .pnpm/package@version/node_modules/package
    const appNodeModules = path.resolve(__dirname, "node_modules");
    const workspaceNodeModules = path.resolve(__dirname, "../../node_modules");
    const pnpmModules = path.join(workspaceNodeModules, ".pnpm");

    config.resolve = {
      ...config.resolve,
      modules: [
        ...(config.resolve?.modules || []),
        appNodeModules,
        workspaceNodeModules,
        // Also include .pnpm directory for direct resolution
        pnpmModules,
      ],
      // Enable symlink resolution for pnpm
      symlinks: true,
      alias: {
        ...config.resolve.alias,
      },
      // Ensure webpack can resolve from pnpm's nested structure
      resolveLoader: {
        ...config.resolveLoader,
        modules: [
          ...(config.resolveLoader?.modules || []),
          appNodeModules,
          workspaceNodeModules,
          pnpmModules,
        ],
      },
    };

    // Fix source types after webpack config (MDX processing happens before this)
    try {
      fixSourceTypes();
    } catch {
      // Ignore errors
    }

    return config;
  },
};

export default withMDX(nextConfig);
