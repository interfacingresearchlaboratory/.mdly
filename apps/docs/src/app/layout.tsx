import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { RootProvider } from "fumadocs-ui/provider/next";
import { siteConfig } from "@/lib/site-config";
import { source } from "@/lib/source";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DocsSidebar } from "@/components/docs-sidebar";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: "%s",
      default: siteConfig.name,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: siteConfig.name,
      siteName: siteConfig.name,
      description: siteConfig.description,
      type: "website",
      url: siteConfig.url,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Build tree from all pages since getPageTree() may be incomplete
  const pages = source.getPages();
  
  // Serialize pages data for command launcher
  const serializedPages = pages.map((page) => {
    const pageData = page.data as any;
    return {
      url: page.url,
      title: pageData?.title || "Untitled",
      description: pageData?.description,
      icon: pageData?.icon,
    };
  });
  
  // Build a tree structure from pages
  const treeMap = new Map<string, any>();
  
  pages.forEach((page) => {
    const url = page.url;
    const segments = url.split('/').filter(Boolean);
    
    // Extract only serializable properties from page data
    const pageData = page.data as any;
    const serializableData = {
      title: pageData?.title,
      description: pageData?.description,
      icon: pageData?.icon,
    };
    
    if (segments.length === 0) {
      // Root page
      treeMap.set('', {
        url: '/',
        name: pageData?.title || 'Home',
        title: pageData?.title || 'Home',
        icon: pageData?.icon,
        data: serializableData,
      });
    } else if (segments.length === 1) {
      // Top-level page
      const topSegment = segments[0];
      if (topSegment !== undefined) {
        treeMap.set(topSegment, {
          url: `/${topSegment}`,
          name: pageData?.title || topSegment,
          title: pageData?.title || topSegment,
          icon: pageData?.icon,
          data: serializableData,
        });
      }
    } else {
      // Nested page - create folder structure (supports sub-folders)
      const folderName = segments[0];
      const lastSegment = segments[segments.length - 1];
      if (folderName !== undefined && lastSegment !== undefined) {
        if (!treeMap.has(folderName)) {
          treeMap.set(folderName, {
            name: folderName,
            title: folderName,
            children: [],
          });
        }
        // Walk into sub-folders for paths deeper than 2 segments
        let currentLevel = treeMap.get(folderName);
        for (let i = 1; i < segments.length - 1; i++) {
          const subName = segments[i];
          if (!subName) continue;
          let existing = currentLevel.children.find(
            (c: any) => c.name === subName && Array.isArray(c.children)
          );
          if (!existing) {
            existing = { name: subName, title: subName, children: [] };
            currentLevel.children.push(existing);
          }
          currentLevel = existing;
        }
        currentLevel.children.push({
          url: `/${segments.join('/')}`,
          name: pageData?.title || lastSegment,
          title: pageData?.title || lastSegment,
          icon: pageData?.icon,
          data: serializableData,
        });
      }
    }
  });
  
  const pageTree = Array.from(treeMap.values());

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen overflow-hidden`}
      >
        <NextTopLoader
          color="hsl(var(--primary))"
          height={2}
          showSpinner={false}
          crawlSpeed={200}
          zIndex={1600}
        />
        <RootProvider search={{ enabled: false }}>
          <SmoothScroll />
          <div className="flex relative flex-1 min-h-0 overflow-hidden">
            <DocsSidebar tree={pageTree} />
            <main className="flex-1 md:ml-64 flex flex-col overflow-hidden bg-background">
              <Header pages={serializedPages} />
              <div className="flex-1 overflow-y-auto">
                {children}
                <Footer />
              </div>
            </main>
          </div>
        </RootProvider>
      </body>
    </html>
  );
}
