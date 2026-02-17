import Link from "next/link";
import { Button } from "@editor/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@editor/ui/utils";

interface DocsNavigationProps {
  previousPage?: {
    url: string;
    title: string;
  } | null;
  nextPage?: {
    url: string;
    title: string;
  } | null;
}

export function DocsNavigation({ previousPage, nextPage }: DocsNavigationProps) {
  if (!previousPage && !nextPage) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t flex gap-4">
      {previousPage ? (
        <Link href={previousPage.url} className="flex-1">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start h-auto py-3 px-4",
              "hover:bg-accent transition-colors"
            )}
          >
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <div className="flex flex-col items-start text-left">
                <span className="text-xs text-muted-foreground mb-1">Previous</span>
                <span className="text-sm font-medium">{previousPage.title}</span>
              </div>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      
      {nextPage ? (
        <Link href={nextPage.url} className="flex-1">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-end h-auto py-3 px-4",
              "hover:bg-accent transition-colors"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end text-right">
                <span className="text-xs text-muted-foreground mb-1">Next</span>
                <span className="text-sm font-medium">{nextPage.title}</span>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
