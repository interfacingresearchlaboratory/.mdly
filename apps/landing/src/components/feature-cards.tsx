"use client";

import { cn } from "@editor/ui/utils";
import { Children, cloneElement, isValidElement } from "react";

interface FeatureCardsProps {
  children: React.ReactNode;
  className?: string;
}

export function FeatureCards({ children, className }: FeatureCardsProps) {
  const childrenArray = Children.toArray(children);
  
  // Filter out non-element children (like whitespace text nodes from MDX)
  // and only keep valid React elements
  const featureCards = childrenArray.filter((child) => isValidElement(child));
  
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 w-full",
        className
      )}
    >
      {featureCards.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child as React.ReactElement<any>, { 
            key: `feature-card-${index}`
          } as any);
        }
        return null;
      })}
    </div>
  );
}
