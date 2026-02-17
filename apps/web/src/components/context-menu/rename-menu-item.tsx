"use client";

import { Pencil } from "lucide-react";
import { cn } from "@editor/ui/utils";

interface RenameMenuItemProps {
  onRename: () => void;
  label?: string;
  className?: string;
}

export function RenameMenuItem({
  onRename,
  label = "Rename",
  className,
}: RenameMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        onRename();
        (e.currentTarget as HTMLButtonElement).blur();
      }}
    >
      <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
      {label}
    </button>
  );
}
