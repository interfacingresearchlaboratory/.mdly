"use client";

import { ToggleGroup, ToggleGroupItem } from "@editor/ui/toggle-group";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hotkey: x cycles through themes (avoids inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active as HTMLElement)?.isContentEditable;
      if (isTyping) return;

      if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        const current = theme || "system";
        if (current === "light") {
          setTheme("dark");
        } else if (current === "dark") {
          setTheme("system");
        } else {
          setTheme("light");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, setTheme]);

  if (!mounted) {
    return null;
  }

  const currentTheme = theme || "system";

  return (
    <ToggleGroup
      type="single"
      value={currentTheme}
      onValueChange={(value) => {
        if (value && typeof value === "string") setTheme(value);
      }}
      className="inline-flex h-8 items-center justify-center rounded-full bg-muted p-1 text-muted-foreground gap-0.5"
    >
      <ToggleGroupItem
        value="system"
        aria-label="System theme"
        className="h-6 w-6 rounded-full p-0 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm hover:bg-muted/80"
      >
        <Monitor className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="light"
        aria-label="Light theme"
        className="h-6 w-6 rounded-full p-0 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm hover:bg-muted/80"
      >
        <Sun className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark theme"
        className="h-6 w-6 rounded-full p-0 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm hover:bg-muted/80"
      >
        <Moon className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
