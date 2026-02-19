/** Direct download URLs for the desktop app. When unset, download page can show "Coming soon". */
function getDownloadUrls() {
  return {
    mac: process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC ?? "",
    windows: process.env.NEXT_PUBLIC_DOWNLOAD_URL_WINDOWS ?? "",
    linux: process.env.NEXT_PUBLIC_DOWNLOAD_URL_LINUX ?? "",
  };
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "MONOid",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://usemonoid.com",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://app.usemonoid.com",
  signUpUrl: process.env.NEXT_PUBLIC_SIGN_UP_URL ?? "https://app.usemonoid.com/sign-up",
  signInUrl: process.env.NEXT_PUBLIC_SIGN_IN_URL ?? "https://app.usemonoid.com/sign-in",
  productUrl: process.env.NEXT_PUBLIC_PRODUCT_URL ?? "https://usemonoid.com",
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.usemonoid.com",
  changelogUrl: process.env.NEXT_PUBLIC_CHANGELOG_URL ?? "https://changelog.usemonoid.com",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@usemonoid.com",
  enterpriseEmail: process.env.NEXT_PUBLIC_ENTERPRISE_EMAIL ?? "info@usemonoid.com",
  download: getDownloadUrls(),
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    "Plan your week. MONOid helps teams turn chaotic workflows into intentional, trackable progress.",
  links: {
    x: process.env.NEXT_PUBLIC_LINK_X ?? "https://x.com/usemonoid",
    linkedin: process.env.NEXT_PUBLIC_LINK_LINKEDIN ?? "https://www.linkedin.com/company/usemonoid",
    tiktok: process.env.NEXT_PUBLIC_LINK_TIKTOK ?? "https://www.tiktok.com/@usemonoid",
    instagram: process.env.NEXT_PUBLIC_LINK_INSTAGRAM ?? "https://www.instagram.com/usemonoid",
  },
  keywords: [
    "MONOid",
    "weekly planning",
    "team productivity",
    "workflow management",
    "task tracking",
    "project planning",
  ],
};

export type SiteConfig = typeof siteConfig;
