"use client";

import { Copy } from "lucide-react";
import { cn } from "@editor/ui/utils";

interface DuplicateMenuItemProps {
  onDuplicate: () => void;
  isDuplicating?: boolean;
  label?: string;
  duplicatingLabel?: string;
  className?: string;
}

export function DuplicateMenuItem({
  onDuplicate,
  isDuplicating = false,
  label = "Duplicate",
  duplicatingLabel = "Duplicating...",
  className,
}: DuplicateMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isDuplicating && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        if (!isDuplicating) {
          onDuplicate();
          (e.currentTarget as HTMLButtonElement).blur();
        }
      }}
      disabled={isDuplicating}
    >
      <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
      {isDuplicating ? duplicatingLabel : label}
    </button>
  );
}
