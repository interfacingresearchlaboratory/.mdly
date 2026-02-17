"use client";

import { Button } from "@editor/ui/button";
import { CommandLauncher } from "./command-launcher";

interface Page {
  url: string;
  title: string;
  description?: string;
  icon?: string;
}

interface HeaderProps {
  pages: Page[];
}

export function Header({ pages }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md">
      <div className="w-full px-6 lg:px-10 flex h-14 items-center justify-end border-b box-border">
        <div className="flex items-center gap-4">
          <CommandLauncher pages={pages} />
          <Button asChild>
            <a href="https://app.usemonoid.com">Open App</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
