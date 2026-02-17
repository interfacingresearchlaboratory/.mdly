import { Button } from "@editor/ui/button";
import { Logo } from "@editor/ui/logo";
import { cn } from "@editor/ui/utils";
import { DownloadButton } from "@/components/download-button";
import { siteConfig } from "@/lib/site-config";

interface CTASectionProps {
  children?: React.ReactNode;
  className?: string;
  useLogo?: boolean;
}

export function CTASection({ children, className, useLogo = false }: CTASectionProps) {
  return (
    <div className={cn("text-center not-prose cta-section", className)}>
      <div className="[&>h1]:![font-size:5.5rem] [&>h1]:md:![font-size:6.5rem] [&>h1]:text-[#0101fd] [&>h2]:text-6xl [&>h2]:md:text-7xl [&>h2]:mb-0 [&>h1]:mt-0">
        {useLogo ? (
          <>
            <div className="!text-xl md:!text-2xl inline-flex items-center justify-center gap-2 flex-wrap">
              <Logo className="text-xl md:text-2xl" /> is time where it matters,
            </div>
            <h1 className="!text-4xl md:!text-5xl">Plan the rest.</h1>
          </>
        ) : (
          children
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 mb-16">
        <Button asChild variant="outline" className="rounded-2xl">
          <a href={siteConfig.signUpUrl}>Sign up</a>
        </Button>
        <DownloadButton href="/download" wrapperClassName="my-0" />
      </div>
    </div>
  );
}
