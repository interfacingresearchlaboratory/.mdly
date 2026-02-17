"use client";

import { Children, cloneElement, useEffect, type ReactNode } from "react";
import { ArrowBigUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@editor/ui/tooltip";
import { Kbd, KbdGroup } from "@editor/ui/kbd";

/** Renders label + hotkey hint for use in tooltips (e.g. EmptyState primary action). */
export function CreateButtonTooltipContent({
  label,
  hotkey,
}: {
  label: string;
  hotkey?: CreateButtonHotkey;
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {hotkey && (
        <div className="flex items-center gap-1">
          <KbdGroup>
            {hotkey.meta && <Kbd>⌘</Kbd>}
            {hotkey.shift && (
              <Kbd>
                <ArrowBigUp className="h-3.5 w-3.5" />
              </Kbd>
            )}
            <Kbd>{hotkey.key.toUpperCase()}</Kbd>
          </KbdGroup>
        </div>
      )}
    </div>
  );
}

export interface CreateButtonHotkey {
  meta: boolean;
  shift: boolean;
  key: string;
}

interface CreateButtonTooltipProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  label: string;
  hotkey?: CreateButtonHotkey;
  onHotkey?: () => void;
  children: ReactNode;
}

function isTypingElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable === true
  );
}

export function CreateButtonTooltip({
  label,
  hotkey,
  onHotkey,
  children,
  ...rest
}: CreateButtonTooltipProps) {
  useEffect(() => {
    if (!hotkey || !onHotkey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingElement(document.activeElement)) return;

      const metaMatch = hotkey.meta && (e.metaKey || e.ctrlKey);
      const shiftMatch = hotkey.shift && e.shiftKey;
      const keyMatch =
        e.key.toLowerCase() === hotkey.key.toLowerCase();

      if (metaMatch && shiftMatch && keyMatch) {
        e.preventDefault();
        onHotkey();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkey, onHotkey]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {cloneElement(Children.only(children) as React.ReactElement, rest)}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <CreateButtonTooltipContent label={label} hotkey={hotkey} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
