"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@editor/ui/utils";

interface OpenInNewTabMenuItemProps {
  href: string;
  label?: string;
  className?: string;
}

export function OpenInNewTabMenuItem({
  href,
  label = "Open in new tab",
  className,
}: OpenInNewTabMenuItemProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
      {label}
    </Link>
  );
}
