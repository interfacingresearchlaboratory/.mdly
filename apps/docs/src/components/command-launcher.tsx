"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@editor/ui/command";
import { Kbd } from "@editor/ui/kbd";
import { Search } from "lucide-react";
import { DynamicIcon } from "@/lib/icon-helper";
import { cn } from "@editor/ui/utils";

interface Page {
  url: string;
  title: string;
  description?: string;
  icon?: string;
}

interface CommandLauncherProps {
  pages: Page[];
}

export function CommandLauncher({ pages }: CommandLauncherProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shortcutHint, setShortcutHint] = useState("Ctrl+K");
  const router = useRouter();

  // Keyboard shortcut handler: Cmd+K / Ctrl+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Detect platform and update shortcut hint after mount (client-side only)
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    setShortcutHint(isMac ? "⌘K" : "Ctrl+K");
  }, []);

  // Create a map of searchable values to pages for lookup
  const pageMap = new Map<string, Page>();
  pages.forEach((page) => {
    const searchableValue = `${page.title} ${page.description || ""}`.trim();
    pageMap.set(searchableValue, page);
  });

  const handleSelect = (searchableValue: string) => {
    const page = pageMap.get(searchableValue);
    if (page) {
      setOpen(false);
      setQuery("");
      router.push(page.url);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground",
          "border border-input bg-background rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors min-w-[200px] sm:min-w-[280px]"
        )}
        aria-label="Open command launcher"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search docs...</span>
        <Kbd>
          {shortcutHint}
        </Kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={`Search documentation... (${shortcutHint})`}
          value={query}
          onValueChange={setQuery}
          className="h-12"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => {
              const searchableValue = `${page.title} ${page.description || ""}`.trim();
              return (
                <CommandItem
                  key={page.url}
                  value={searchableValue}
                  onSelect={() => handleSelect(searchableValue)}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  {page.icon && (
                    <DynamicIcon
                      name={page.icon}
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">
                      {page.title}
                    </span>
                    {page.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {page.description}
                      </span>
                    )}
                  </div>
                 
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
