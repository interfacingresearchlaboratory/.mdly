"use client";

import { useEffect, useState } from "react";
import { ArrowBigUp, Keyboard } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editor/ui/popover";
import { Button } from "@editor/ui/button";
import { Kbd, KbdGroup } from "@editor/ui/kbd";
import {
  EDITOR_SHORTCUT_GROUPS,
  type ShortcutEntry,
} from "@editor/ui/editor/shortcuts";
import { cn } from "@editor/ui/lib/utils";

function formatKeyDisplay(key: string): string {
  if (key === "Tab") return "Tab";
  if (key === "Enter") return "Enter";
  if (key === "\\") return "\\";
  if (key.length === 1) return key.toUpperCase();
  return key;
}

function ShortcutKeys({ entry }: { entry: ShortcutEntry }) {
  if (entry.example !== undefined) {
    return (
      <Kbd className="font-mono text-xs">
        {entry.example}
      </Kbd>
    );
  }
  const keys = entry.keys;
  if (!keys?.key) return null;
  return (
    <KbdGroup className="flex items-center gap-1">
      {keys.meta && <Kbd>⌘</Kbd>}
      {keys.shift && (
        <Kbd>
          <ArrowBigUp className="h-3.5 w-3.5" />
        </Kbd>
      )}
      <Kbd>{formatKeyDisplay(keys.key)}</Kbd>
    </KbdGroup>
  );
}

function isTypingElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = (el as HTMLElement).tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable === true
  );
}

export function ShortcutsDirectory() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingElement(document.activeElement)) return;
      const isSlash = e.key === "/" && (e.metaKey || e.ctrlKey);
      const isQuestion = e.key === "?";
      if (isSlash || isQuestion) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-8 w-8"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className={cn(
          "w-72 p-0 max-h-[60vh] overflow-hidden flex flex-col",
          "rounded-md border bg-popover text-popover-foreground shadow-md"
        )}
      >
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold">Shortcuts</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Editor and navigation shortcuts.
          </p>
        </div>
        <div className="overflow-auto p-2">
          {EDITOR_SHORTCUT_GROUPS.map((group) => (
            <div key={group.heading ?? "default"} className="mb-3 last:mb-0">
              {group.heading && (
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {group.heading}
                </div>
              )}
              <ul className="space-y-0.5">
                {group.entries.map((entry) => (
                  <li
                    key={entry.label}
                    className="flex justify-between items-center gap-4 py-1.5 px-2 rounded-sm hover:bg-accent/50"
                  >
                    <span className="text-sm truncate">{entry.label}</span>
                    <ShortcutKeys entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
