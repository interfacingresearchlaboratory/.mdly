const domain = "usemonoid.com";

export const siteConfig = {
  name: "Docs - MONOid",
  url: `https://docs.${domain}`,
  appUrl: `https://app.${domain}`,
  productUrl: `https://${domain}`,
  docsUrl: `https://docs.${domain}`,
  pricingUrl: `https://pricing.${domain}`,
  privacyUrl: `https://${domain}/privacy`,
  termsUrl: `https://${domain}/terms`,
  changelogUrl: `https://changelog.${domain}`,
  supportEmail: `support@${domain}`,
  description:
    `Documentation for MONOid. Learn how to use MONOid to turn chaotic, ad-hoc spending into intentional, trackable investments.`,
  links: {
    x: "https://x.com/usemonoid",
    linkedin: "https://www.linkedin.com/company/usemonoid",
    tiktok: "https://www.tiktok.com/@usemonoid",
    instagram: `https://www.instagram.com/${domain}`,
  },
  keywords: [
    "Documentation",
    "MONOid",
    "MONOid docs",
    "MONOid documentation",
    "user guide",
    "help",
    "tutorial",
    "getting started",
    "productivity",
    "task management",
    "routine management",
    "review management",
    "productivity",
    "task management",
    "routine management",
    "review management",
  ],
}

export type SiteConfig = typeof siteConfig
