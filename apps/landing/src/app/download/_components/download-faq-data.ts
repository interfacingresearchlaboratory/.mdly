export interface DownloadFaqItem {
  question: string;
  answer: string;
}

export const downloadFaqData: DownloadFaqItem[] = [
  {
    question: "Is the desktop app the same as the web app?",
    answer:
      "Yes. The desktop app is the same MONOid experience as the browser, packaged so you can install it and use it like a native app. Your data and account are shared between the two.",
  },
  {
    question: "Do I need to install the desktop app to use MONOid?",
    answer:
      "No. You can use MONOid entirely in your browser. The desktop app is optional and useful if you prefer a dedicated window, system integration, or offline-capable access.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "We offer builds for macOS, Windows, and Linux. The download page shows only the builds that are currently available; more platforms may be added over time.",
  },
  {
    question: "How do I get updates?",
    answer:
      "When we publish a new release, you can download the latest installer from the download page or from GitHub Releases. We’ll add in-app update notifications in a future release.",
  },
];
