"use client";

import { cn } from "@editor/ui/utils";
import { Children, cloneElement, isValidElement } from "react";
import { SolutionCardIndexContext } from "./solution-card-context";

interface SolutionCardsProps {
  children: React.ReactNode;
  className?: string;
}

const FullWidthLine = ({ timeLabel }: { timeLabel?: string } = { timeLabel: undefined }) => (
  <div className="w-screen relative left-1/2 -ml-[50vw] h-0 border-t border-dashed border-border">
    {timeLabel && (
      <div
        className="opacity-70 z-20 absolute top-0 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-xs font-medium z-10"
        style={{
          left: "max(0.5rem, calc(50vw - 40rem + 0.7rem))",
          transform: "translateY(calc(-50% + 3px))",
        }}
        aria-hidden
      >
        {timeLabel}
      </div>
    )}
  </div>
);

const FullWidthLineAt = ({ top, timeLabel }: { top: string; timeLabel?: string }) => (
  <div
    className="absolute left-1/2 -ml-[50vw] w-screen h-0 border-t border-dashed border-border pointer-events-none"
    style={{ top }}
    aria-hidden
  >
    {timeLabel && (
      <div
        className="opacity-70 z-20 absolute flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-xs font-medium -translate-y-1/2 z-10"
        style={{ left: "max(0.5rem, calc(50vw - 40rem + 0.7rem))" }}
        aria-hidden
      >
        {timeLabel}
      </div>
    )}
  </div>
);


export function SolutionCards({ children, className }: SolutionCardsProps) {
  const childrenArray = Children.toArray(children);
  
  // Filter out non-element children (like whitespace text nodes from MDX)
  // and only keep valid React elements
  const solutionCards = childrenArray.filter((child) => isValidElement(child));
  
  return (
    <div
      className={cn(
        "flex flex-col mt-0 mb-12 w-full",
        className
      )}
    >
      <FullWidthLine timeLabel="7" />
      {solutionCards.map((child, index) => {
        if (isValidElement(child)) {
          const props = child.props as Record<string, unknown>;
          const hourBase = 7 + index * 6;
          return (
            <SolutionCardIndexContext.Provider key={`solution-card-${index}`} value={index}>
              <div className="relative">
                <FullWidthLineAt top="20%" timeLabel={String(hourBase + 1)} />
                <FullWidthLineAt top="40%" timeLabel={String(hourBase + 2)} />
                <FullWidthLineAt top="60%" timeLabel={String(hourBase + 3)} />
                <FullWidthLineAt top="80%" timeLabel={String(hourBase + 4)} />
                <div className="relative z-10">
                  {cloneElement(child as React.ReactElement<any>, { 
                    ...props, 
                    index,
                    colorIndex: index,
                  } as any)}
                </div>
                <FullWidthLine timeLabel={String(hourBase + 5)} />
              </div>
            </SolutionCardIndexContext.Provider>
          );
        }
        return null;
      })}
    </div>
  );
}
