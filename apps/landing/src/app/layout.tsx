import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "next-themes";
import { siteConfig } from "@/lib/site-config";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HashScroll } from "@/components/hash-scroll";
import { MockSeedProvider } from "@/components/mock-seed-provider";
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextTopLoader
          color="var(--toploader-color)"
          height={2}
          showSpinner={false}
          crawlSpeed={200}
          zIndex={1600}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <div className="min-h-screen bg-background relative flex flex-col overflow-x-clip">
            <HashScroll />
            <Header />
            <MockSeedProvider>{children}</MockSeedProvider>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
