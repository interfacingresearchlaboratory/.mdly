import type { Metadata } from "next";
import fs from "fs/promises";
import path from "path";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms and Conditions",
    description:
      "Read the official MONOid terms and conditions outlining usage policies, intellectual property, data handling, and acceptable use for our weekly planning platform.",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: "Terms and Conditions",
      siteName: siteConfig.name,
      description:
        "Understand your rights and responsibilities when using MONOid. This includes content licensing, data privacy, user conduct, and acceptable use of our weekly planning tools.",
      type: "website",
      url: `${siteConfig.url}/terms`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Terms and Conditions",
      description:
        "Planning is a design decision. Treat it like one. MONOid helps individuals and teams turn chaotic weeks into intentional, trackable plans.",
    },
    alternates: {
      canonical: `${siteConfig.url}/terms`,
      languages: {
        "en-US": `${siteConfig.url}/terms`,
      },
    },
  };
}

export default async function Terms() {
  // Construct the path to the markdown file
  // Try multiple path strategies for different environments
  let rawMarkdown = "# Terms and Conditions\n\nContent unavailable.";
  const possiblePaths = [
    path.join(process.cwd(), "content", "legal", "terms.md"),
    path.join(process.cwd(), "apps", "landing", "content", "legal", "terms.md"),
    path.resolve(process.cwd(), "content", "legal", "terms.md"),
    path.join(process.cwd(), "src", "content", "legal", "terms.md"),
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
          Terms and Conditions
        </h1>
        <MarkdownRenderer markdown={rawMarkdown} />
      </div>
    </div>
  );
}
