import Link from "next/link";
import { Button } from "@editor/ui/button";
import { Logo } from "@editor/ui/logo";
import { siteConfig } from "@/lib/site-config";
import { DownloadButton } from "@/components/download-button";
import { FeaturesLink } from "@/components/features-link";
import { MobileMenu } from "@/components/mobile-menu";

const navigationLinks = [
  { title: "Features", href: "/#features" },
  { title: "Enterprise", href: `mailto:${siteConfig.enterpriseEmail}` },
  { title: "Pricing", href: "/pricing" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="page-container relative flex h-14 items-center justify-between">
        <Link href="/">
          <Logo className="text-lg" />
        </Link>
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6">
          {navigationLinks.map((link) =>
            link.href.includes("#") || link.href.startsWith("mailto:") ? (
              link.href.includes("#features") ? (
                <FeaturesLink
                  key={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </FeaturesLink>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </a>
              )
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.title}
              </Link>
            )
          )}
          <a
            href={siteConfig.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild className="rounded-2xl">
            <a href={siteConfig.signInUrl}>Sign in</a>
          </Button>
          <div className="hidden md:flex">
            <DownloadButton href="/download" className="my-0" />
          </div>
          <MobileMenu navigationLinks={navigationLinks} />
        </div>
      </div>
    </header>
  );
}
