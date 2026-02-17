import Link from "next/link";
import { Button } from "@editor/ui/button";
import { siteConfig } from "@/lib/site-config";
import { FullWidthSeparator } from "@/components/full-width-separator";
import { SectionBuffer } from "@/components/section-buffer";
import { SectionWrapper } from "@/components/section-wrapper";
import { CTASection } from "@/components/cta-section";
import { downloadFaqData } from "./_components/download-faq-data";

const platforms = [
  {
    id: "mac" as const,
    label: "macOS",
    url: siteConfig.download.mac,
    description: "macOS 10.15+",
  },
  {
    id: "windows" as const,
    label: "Windows",
    url: siteConfig.download.windows,
    description: "Windows 10+",
  },
  {
    id: "linux" as const,
    label: "Linux",
    url: siteConfig.download.linux,
    description: "64-bit AppImage or deb",
  },
] as const;

export const metadata = {
  title: "Download MONOid",
  description: "Download the MONOid desktop app for macOS, Windows, or Linux.",
};

export default function DownloadPage() {
  const platformsWithUrl = platforms.filter((p) => p.url);

  return (
    <div className="page-container pt-32 flex-1 w-full">
      <div className="mx-auto max-w-5xl text-center pb-20">
        <h1 className="text-4xl font-semibold tracking-tight text-[#0101fd] md:text-5xl">
          Download MONOid
        </h1>
        <p className="mt-4 text-muted-foreground">
          Choose your platform. The app is also available in your browser at{" "}
          <Link
            href={siteConfig.appUrl}
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            {siteConfig.appUrl.replace(/^https?:\/\//, "")}
          </Link>
          .
        </p>

        {platformsWithUrl.length > 0 ? (
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            {platformsWithUrl.map(({ id, label, url, description }) => (
              <div key={id} className="flex flex-col items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-auto w-full min-w-[200px] flex-col gap-2 rounded-2xl py-6 sm:w-[200px]"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 no-underline"
                  >
                    <span>{label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {description}
                    </span>
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-sm text-muted-foreground">
            Release builds will appear here once published to GitHub Releases.
          </p>
        )}
      </div>

      <FullWidthSeparator />
      <SectionBuffer variant="green-dashed" />
      <FullWidthSeparator />

      <SectionWrapper variant="bordered-hash">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 gap-8 w-full max-w-7xl mx-auto">
          <div className="p-2 md:p-10">
            <div className="text-5xl md:text-6xl font-base text-[#0101fd] mb-4">
              FAQ
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-col divide-y divide-border">
              {downloadFaqData.map((item) => (
                <div key={item.question} className="py-6 px-4">
                  <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <FullWidthSeparator />
      <SectionBuffer variant="green-dashed" />
      <FullWidthSeparator />
      <SectionWrapper>
        <CTASection useLogo={true} />
      </SectionWrapper>
      <FullWidthSeparator />
      <SectionBuffer />
      <FullWidthSeparator />
    </div>
  );
}
