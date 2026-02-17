"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@editor/ui/utils";

interface PricingToggleProps {
  value: "month" | "year";
  onChange: (value: "month" | "year") => void;
}

const OPTIONS = [
  { value: "month" as const, label: "Monthly" },
  { value: "year" as const, label: "Yearly" },
] as const;

export function PricingToggle({ value, onChange }: PricingToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const activeIndex = value === "year" ? 1 : 0;
  const targetIndex = hoveredIndex ?? activeIndex;

  useEffect(() => {
    const btn = buttonRefs.current[targetIndex];
    const container = containerRef.current;
    if (!btn || !container) return;
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [targetIndex]);

  return (
    <div
      ref={containerRef}
      className="relative flex gap-0.5 p-0.5 rounded-lg border border-border bg-muted/30"
    >
      {OPTIONS.map((opt, index) => (
        <button
          key={opt.value}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          type="button"
          onClick={() => onChange(opt.value)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={cn(
            "relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors",
            targetIndex === index
              ? "!text-white [&_svg]:!text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
      <div
        className="absolute z-0 top-0.5 bottom-0.5 rounded-md bg-[#0101fd] transition-all duration-200 ease-out"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
          opacity: pillStyle.opacity,
        }}
      />
    </div>
  );
}
