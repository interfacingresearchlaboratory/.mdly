import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy",
    description: "Your data stays yours. Learn how we protect your privacy.",
    openGraph: { title: "Privacy Policy", siteName: siteConfig.name },
  };
}

const contentLegalDir = path.join(process.cwd(), "content", "legal");

export default async function Privacy() {
  let rawMarkdown = "# Privacy Policy\n\nContent unavailable.";
  const filePath = path.join(contentLegalDir, "privacy.md");
  try {
    rawMarkdown = await fs.readFile(filePath, "utf8");
  } catch {
    // Fallback already set
  }
  return (
    <div className="page-container pt-32 flex-1 w-full pb-20">
      <div className="mx-auto max-w-6xl gap-16 space-y-20">
        <h1 className="text-center text-5xl lg:text-7xl font-normal tracking-tight text-gray-900 dark:text-gray-100">
          Privacy Policy
        </h1>
        <MarkdownRenderer markdown={rawMarkdown} />
      </div>
    </div>
  );
}
