"use client";

import { cn } from "@editor/ui/utils";

interface ProblemCardProps {
  title: string;
  mockup: React.ReactNode;
  className?: string;
  index?: number;
}

export function ProblemCard({ title, mockup, className, index = 0 }: ProblemCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border bg-background overflow-hidden transition-colors relative",
        "hover:border-primary/50",
        className
      )}
    >
      {/* App screenshot */}
      <div className="relative w-full overflow-hidden bg-muted/20">
        <div className="w-full h-[200px] md:h-[220px] flex items-center justify-center p-2 md:p-3">
          <div className="w-full h-full max-w-full max-h-full flex items-center justify-center scale-[0.65] md:scale-75">
            {mockup}
          </div>
        </div>
        
        {/* Problem text overlay - bottom left */}
        <div className="absolute bottom-0 left-0 p-2 md:p-3">
          <div className="text-[12px] md:text-[12px] font-normal text-gray-900 dark:text-gray-100 bg-background/95 backdrop-blur-sm rounded-md px-1.5 py-0.5 shadow-sm leading-tight whitespace-nowrap">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}
