import Link from "next/link";
import { Button } from "@editor/ui/button";
import { siteConfig } from "@/lib/site-config";
import { Logo} from "@editor/ui/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:bg-transparent lg:backdrop-blur-none border-b lg:border-b-0">
      <div className="px-6 lg:px-10 flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href={siteConfig.productUrl}
            className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
          >
            <Logo/>
          </Link>
   
          <Link
            href={siteConfig.productUrl}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href={siteConfig.pricingUrl}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href={siteConfig.docsUrl}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href={siteConfig.appUrl}>Open App</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
