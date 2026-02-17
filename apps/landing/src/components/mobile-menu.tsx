"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@editor/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@editor/ui/sheet";
import { VisuallyHidden } from "@editor/ui/visually-hidden";
import { siteConfig } from "@/lib/site-config";
import { DownloadButton } from "@/components/download-button";
import { FeaturesLink } from "@/components/features-link";

interface NavigationLink {
  title: string;
  href: string;
}

interface MobileMenuProps {
  navigationLinks: NavigationLink[];
}

export function MobileMenu({ navigationLinks }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-full max-w-none p-0">
        <VisuallyHidden>
          <SheetTitle>Navigation menu</SheetTitle>
        </VisuallyHidden>
        <div className="flex flex-col h-full">
          <div className="block space-y-2 px-6 pt-20 pb-8">
            <h2 className="text-3xl font-normal text-[#0101fd] pb-2">MONOid</h2>
            {navigationLinks.map((link) => (
              <SheetClose key={link.href} asChild>
                {link.href.includes("#") || link.href.startsWith("mailto:") ? (
                  link.href.includes("#features") ? (
                    <FeaturesLink className="block text-3xl font-normal text-foreground hover:text-muted-foreground transition-colors py-2">
                      {link.title}
                    </FeaturesLink>
                  ) : (
                    <a
                      href={link.href}
                      className="block text-3xl font-normal text-foreground hover:text-muted-foreground transition-colors py-2"
                    >
                      {link.title}
                    </a>
                  )
                ) : (
                  <Link
                    href={link.href}
                    className="block text-3xl font-normal text-foreground hover:text-muted-foreground transition-colors py-2"
                  >
                    {link.title}
                  </Link>
                )}
              </SheetClose>
            ))}
            <SheetClose asChild>
              <a
                href={siteConfig.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-3xl font-normal text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                Docs
              </a>
            </SheetClose>
            <SheetClose asChild>
              <a
                href={siteConfig.changelogUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-3xl font-normal text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                Changelog
              </a>
            </SheetClose>
            <div className="pt-2 space-y-0">
              <SheetClose asChild>
                <Button variant="outline" asChild className="justify-start rounded-2xl mb-2">
                  <a href={siteConfig.signInUrl}>Sign in</a>
                </Button>
              </SheetClose>
              <div onClick={() => setIsMenuOpen(false)}>
                <DownloadButton href="/download" className="my-0" wrapperClassName="justify-start" />
              </div>
              <div className="space-y-0 pt-2">
                <SheetClose asChild>
                  <a
                    href={siteConfig.links.x}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-lg font-normal text-muted-foreground hover:text-foreground transition-colors py-0"
                  >
                    X
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href={siteConfig.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-lg font-normal text-muted-foreground hover:text-foreground transition-colors py-0"
                  >
                    LinkedIn
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href={siteConfig.links.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-lg font-normal text-muted-foreground hover:text-foreground transition-colors py-0"
                  >
                    TikTok
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-lg font-normal text-muted-foreground hover:text-foreground transition-colors py-0"
                  >
                    Instagram
                  </a>
                </SheetClose>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
