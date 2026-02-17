import { Button } from "@editor/ui/button";
import { cn } from "@editor/ui/utils";
import { MonitorDown } from "lucide-react";

interface DownloadButtonProps {
  href?: string;
  className?: string;
  /** Applied to the wrapper div (e.g. "justify-start" for left alignment) */
  wrapperClassName?: string;
}

export function DownloadButton({ href, className, wrapperClassName }: DownloadButtonProps) {
  return (
    <div className={cn("not-prose my-4 flex justify-center [&_a]:no-underline [&_a:hover]:no-underline [&_a]:[text-decoration:none!important] [&_a:hover]:[text-decoration:none!important]", wrapperClassName)}>
      <Button
        asChild
        
        variant="outline"
        className={cn(
          "rounded-2xl",
          "no-underline [&>a]:no-underline [&>a:hover]:no-underline [&>a]:[text-decoration:none!important] [&>a:hover]:[text-decoration:none!important]",
          "bg-black border-black",
          "[&>a]:!text-white [&>a:hover]:!text-black",
          "dark:bg-white dark:border-white dark:[&>a]:!text-black dark:[&>a:hover]:!text-white",
          className
        )}
      >
        <a href={href || "#"} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} style={{ textDecoration: 'none' }} className="flex items-center gap-2 !text-white hover:!text-black dark:!text-black dark:hover:!text-white">
          <MonitorDown className="h-4 w-4" />
          Install
        </a>
      </Button>
    </div>
  );
}
