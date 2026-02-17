"use client";

import { cn } from "@editor/ui/utils";
import { useContext } from "react";
import { SolutionCardIndexContext } from "./solution-card-context";

/** Routine-block style colors from the calendar mockup - one per solution card */
const CARD_COLORS = [
  { bg: "rgba(59, 130, 246, 0.22)", border: "#3b82f6", title: "#1d4ed8" },   // blue
  { bg: "rgba(245, 158, 11, 0.22)", border: "#f59e0b", title: "#b45309" },   // yellow/amber
  { bg: "rgba(16, 185, 129, 0.22)", border: "#10b981", title: "#047857" },   // green
] as const;

interface SolutionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
  colorIndex?: number;
  mockup?: React.ReactNode;
  inverted?: boolean;
}

export function SolutionCard({
  title,
  children,
  className,
  index = 0,
  colorIndex,
  mockup,
  inverted = false,
}: SolutionCardProps) {
  const contextIndex = useContext(SolutionCardIndexContext);
  const ci = colorIndex ?? index ?? contextIndex;
  const { bg: bgColor, border: borderColor, title: titleColor } = CARD_COLORS[ci % CARD_COLORS.length];

  return (
    <div
      className={cn(
        "w-full transition-colors",

        className,
      )}>
      <div className="flex flex-col md:grid md:grid-cols-2 md:items-start gap-y-20">
        {/* Header column: title + child text (order swaps when inverted) */}
        <div
          className={cn(
            "pr-6",
            inverted && "md:order-2",
            ci === 1 && "pt-[80px] md:pt-[120px]",
            ci === 2 && "pt-[160px] md:pt-[240px]"
          )}
        >
        <div
          className="z-10 flex flex-col gap-2 w-full p-4 border-y border-r rounded-r-lg min-h-[240px] md:min-h-[360px]"
          style={{ backgroundColor: bgColor, borderColor }}
        >
          <h2 className="!text-5xl !md:text-6xl font-medium mb-6" style={{ color: titleColor }}>{title}</h2>
          <div className="!text-muted-foreground prose:text-muted-foreground prose dark:prose-invert max-w-none md:text-xl">
            {children}
          </div>
        </div>
        </div>
      
        {/* Mockup column (order swaps when inverted) */}
        <div
          className={cn(
            "flex flex-col gap-6 w-full pt-10 md:pt-0",
            inverted && "md:order-1",
          )}>
          <div
            className={cn(
              "flex items-center justify-center rounded-lg border border-border min-h-[400px] md:min-h-[600px] h-full overflow-hidden relative",
              mockup
                ? "p-3 md:p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20"
                : "bg-muted",
            )}>
            {mockup ? (
              <div className="absolute inset-3 md:inset-6 w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)] h-[calc(100%-1.5rem)] md:h-[calc(100%-3rem)]">
                {mockup}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Insert example</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
