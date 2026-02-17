"use client";

import { cn } from "@editor/ui/utils";
import { Children, cloneElement, isValidElement } from "react";

const DEMO_GRADIENTS = {
  blue: "bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:from-blue-950/30 dark:via-sky-950/20 dark:to-indigo-950/30",
  yellow: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30",
  green: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30",
} as const;

interface DemoColumnCardProps {
  title: string;
  description: string;
  demo?: React.ReactNode;
  footer?: React.ReactNode;
  gradient?: keyof typeof DEMO_GRADIENTS;
  className?: string;
}

function DemoColumnCardPlaceholder({ gradient }: { gradient?: keyof typeof DEMO_GRADIENTS }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[400px] md:min-h-[500px] items-center justify-center text-muted-foreground text-sm",
        gradient ? DEMO_GRADIENTS[gradient] : "bg-muted/20"
      )}
      aria-hidden
    >
      Demo
    </div>
  );
}

export function DemoColumnCard({
  title,
  description,
  demo,
  footer,
  gradient,
  className,
}: DemoColumnCardProps) {
  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      <div
        className={cn(
          "h-[360px] md:h-[440px] shrink-0 overflow-hidden relative",
          gradient ? DEMO_GRADIENTS[gradient] : "bg-muted/20"
        )}
      >
        {demo ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {demo}
          </div>
        ) : (
          <DemoColumnCardPlaceholder gradient={gradient} />
        )}
      </div>
      <div className="border-t border-border p-4">
        <h3 className="text-2xl font-medium mb-3 text-[#0101fd]">
          {title}
        </h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          {description}
        </p>
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}

interface DemoColumnCardsProps {
  children: React.ReactNode;
  className?: string;
}

export function DemoColumnCards({ children, className }: DemoColumnCardsProps) {
  const childrenArray = Children.toArray(children);
  const cards = childrenArray.filter((child) => isValidElement(child));

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-0 w-full",
        className
      )}
    >
      {cards.map((child, index) => {
        if (isValidElement(child)) {
          const isMiddleOrRight = index === 1 || index === 2;
          return (
            <div
              key={`demo-column-${index}`}
              className={cn(
                "flex flex-col min-h-0",
                index > 0 && "border-t md:border-t-0 border-border",
                isMiddleOrRight && "md:border-l border-border"
              )}
            >
              {cloneElement(child as React.ReactElement, {
                key: `demo-column-card-${index}`,
              })}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
