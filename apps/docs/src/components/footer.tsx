"use client";

import Link from "next/link";
import { PureLink } from "./purelink";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "@editor/ui/logo";

const productLinks = [
  { title: "Features", href: siteConfig.productUrl },
  { title: "Pricing", href: siteConfig.pricingUrl },
  { title: "Contact Us", href: `mailto:${siteConfig.supportEmail}` },
];

const resourceLinks = [
  { title: "Changelog", href: siteConfig.changelogUrl },
  { title: "Documentation", href: siteConfig.docsUrl },
  { title: "Privacy Policy", href: siteConfig.privacyUrl },
  { title: "Terms and Conditions", href: siteConfig.termsUrl },
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
      <footer className="hidden md:block z-10 w-full md:pt-20 text-sm border-t">
        <div className="grid grid-cols-4 w-full pb-20 px-10">
          <div>
            <Link href={siteConfig.productUrl}>
              <div className="relative inline-block mb-4">
                <span className="text-lg font-medium"><Logo/></span>
              </div>
            </Link>
          </div>
          <div className="space-y-1">
            <div className="font-medium">Product</div>
            {productLinks.map((link, i) => (
              <div key={i}>
                <PureLink href={link.href}>{link.title}</PureLink>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="font-medium">Resources</div>
            {resourceLinks.map((link, i) => (
              <div key={i}>
                <PureLink href={link.href}>{link.title}</PureLink>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="font-medium">Connect</div>
            {connectLinks.map((link, i) => (
              <div key={i}>
                <PureLink href={link.href}>{link.title}</PureLink>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center pb-10 px-10 w-full">
          <div>© 2025 MONOid. All rights reserved.</div>
          <div className="flex gap-5 items-center">
            <ThemeToggle />
          </div>
        </div>
      </footer>

      {/* Mobile Footer */}
      <div className="pt-10 block md:hidden z-10 w-full p-4 pb-20 text-sm border-t">
        <div className="flex flex-col items-center">
          <Link href={siteConfig.productUrl}>
            <div className="relative inline-block mb-4">
              <span className="text-lg font-medium">MONOid</span>
            </div>
          </Link>
          <div className="pt-5 flex flex-wrap gap-3 items-center justify-center">
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-2 w-full py-10 space-y-5">
          <div className="space-y-1">
            <div className="font-medium">Product</div>
            {productLinks.map((link, i) => (
              <div key={i}>
                <PureLink href={link.href}>{link.title}</PureLink>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="font-medium">Resources</div>
            {resourceLinks.map((link, i) => (
              <div key={i}>
                <PureLink href={link.href}>{link.title}</PureLink>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <div className="font-medium">Connect</div>
            {connectLinks.map((link, i) => (
              <div key={i}>
                <PureLink href={link.href}>{link.title}</PureLink>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-5 text-center">
          © 2025 MONOid
          <br />
          All rights reserved.
        </div>
      </div>
    </>
  );
}
