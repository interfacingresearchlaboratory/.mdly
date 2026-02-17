import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy",
    description:
      "Your data stays yours. MONOid never sells or shares your personal information. Learn how MONOid protects your privacy, data, and trust.",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: "Privacy Policy",
      siteName: siteConfig.name,
      description:
        "Your data stays yours. Learn how MONOid protects your privacy, never sells your information, and stays transparent about how data is handled.",
      url: `${siteConfig.url}/privacy`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Privacy Policy",
      description:
        "MONOid doesn't sell or share your personal info—ever. Find out how we protect your data.",
    },
    alternates: {
      canonical: `${siteConfig.url}/privacy`,
      languages: {
        "en-US": `${siteConfig.url}/privacy`,
      },
    },
  };
}

export default async function Privacy() {
  // Construct the path to the markdown file
  // Try multiple path strategies for different environments
  let rawMarkdown = "# Privacy Policy\n\nContent unavailable.";
  const possiblePaths = [
    path.join(process.cwd(), "content", "legal", "privacy.md"),
    path.join(process.cwd(), "apps", "landing", "content", "legal", "privacy.md"),
    path.resolve(process.cwd(), "content", "legal", "privacy.md"),
    path.join(process.cwd(), "src", "content", "legal", "privacy.md"),
  ];

  for (const filePath of possiblePaths) {
    try {
      rawMarkdown = await fs.readFile(filePath, "utf8");
      break;
    } catch {
      continue;
    }
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
