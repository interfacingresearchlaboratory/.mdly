/** Direct download URLs for the desktop app (e.g. GitHub Release assets). When unset, download page shows "Coming soon". */
function getDownloadUrls() {
  return {
    mac: process.env.NEXT_PUBLIC_DOWNLOAD_URL_MAC ?? "",
    windows: process.env.NEXT_PUBLIC_DOWNLOAD_URL_WINDOWS ?? "",
    linux: process.env.NEXT_PUBLIC_DOWNLOAD_URL_LINUX ?? "",
  };
}

export const siteConfig = {
  name: "MONOid",
  url: "https://usemonoid.com",
  appUrl: "https://app.usemonoid.com",
  signUpUrl: "https://app.usemonoid.com/sign-up",
  signInUrl: "https://app.usemonoid.com/sign-in",
  productUrl: "https://usemonoid.com",
  docsUrl: "https://docs.usemonoid.com",
  changelogUrl: "https://changelog.usemonoid.com",
  supportEmail: "support@usemonoid.com",
  enterpriseEmail: "info@usemonoid.com",
  /** Per-platform download URLs (GitHub Releases: .../releases/download/TAG/FILENAME). */
  download: getDownloadUrls(),
  description:
    "Plan your week. MONOid helps teams turn chaotic workflows into intentional, trackable progress.",
  links: {
    x: "https://x.com/usemonoid",
    linkedin: "https://www.linkedin.com/company/usemonoid",
    tiktok: "https://www.tiktok.com/@usemonoid",
    instagram: "https://www.instagram.com/usemonoid",
  },
  keywords: [
    "MONOid",
    "weekly planning",
    "team productivity",
    "workflow management",
    "startup tools",
    "SME tools",
    "task tracking",
    "project planning",
    "weekly goals",
    "team coordination",
    "planning tools",
  ],
}

export type SiteConfig = typeof siteConfig
