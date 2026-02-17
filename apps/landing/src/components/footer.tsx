"use client";

import Link from "next/link";
import { Logo } from "@editor/ui/logo";
import { PureLink } from "./purelink";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site-config";

const productLinks = [
  { title: "Features", href: "/#features", external: false },
  { title: "Pricing", href: "/pricing", external: false },
  { title: "Contact Us", href: `mailto:${siteConfig.supportEmail}`, external: true },
];

const resourceLinks = [
  { title: "Changelog", href: siteConfig.changelogUrl, external: true },
  { title: "Docs", href: siteConfig.docsUrl, external: true },
  { title: "Privacy Policy", href: "/privacy", external: false },
  { title: "Terms and Conditions", href: "/terms", external: false },
];

const connectLinks = [
  { title: "X", href: siteConfig.links.x },
  { title: "LinkedIn", href: siteConfig.links.linkedin },
  { title: "TikTok", href: siteConfig.links.tiktok },
  { title: "Instagram", href: siteConfig.links.instagram },
];

export function Footer() {
  return (
    <>
      {/* Desktop Footer */}
      <footer className="hidden md:block z-10 w-full md:pt-20 text-sm bg-[#fafcff] dark:bg-[#080808]">
        <div className="page-container">
          <div className="flex flex-col items-center w-full pb-20">
            <div className="flex justify-around w-full">
              <div className="flex-1">
                <Link href="/" className="inline-block mb-4">
                  <Logo className="text-lg" />
                </Link>
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-medium text-muted-foreground">Product</div>
                {productLinks.map((link, i) => (
                  <div key={i}>
                    <PureLink href={link.href} className="text-foreground hover:text-foreground/80">{link.title}</PureLink>
                  </div>
                ))}
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-medium text-muted-foreground">Resources</div>
                {resourceLinks.map((link, i) => (
                  <div key={i}>
                    <PureLink href={link.href} className="text-foreground hover:text-foreground/80">{link.title}</PureLink>
                  </div>
                ))}
              </div>
              <div className="space-y-1 flex-1">
                <div className="font-medium text-muted-foreground">Connect</div>
                {connectLinks.map((link, i) => (
                  <div key={i}>
                    <PureLink href={link.href} className="text-foreground hover:text-foreground/80">{link.title}</PureLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pb-10 w-full">
            <div className="text-muted-foreground">© 2025 MONOid. All rights reserved.</div>
            <div className="flex gap-5 items-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Footer */}
      <div className="pt-10 block md:hidden z-10 w-full pb-20 text-sm bg-[#fafcff] dark:bg-[#080808]">
        <div className="page-container">
          <div className="flex flex-col items-center">
            <Link href="/" className="mb-4">
              <Logo className="text-lg" />
            </Link>
            <div className="pt-5 flex flex-wrap gap-3 items-center justify-center">
              <ThemeToggle />
            </div>
          </div>

          <div className="grid grid-cols-2 w-full py-10 space-y-5">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Product</div>
              {productLinks.map((link, i) => (
                <div key={i}>
                  <PureLink href={link.href} className="text-foreground hover:text-foreground/80">{link.title}</PureLink>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Resources</div>
              {resourceLinks.map((link, i) => (
                <div key={i}>
                  <PureLink href={link.href} className="text-foreground hover:text-foreground/80">{link.title}</PureLink>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Connect</div>
              {connectLinks.map((link, i) => (
                <div key={i}>
                  <PureLink href={link.href} className="text-foreground hover:text-foreground/80">{link.title}</PureLink>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-5 text-center text-muted-foreground">
            © 2025 MONOid
            <br />
            All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
