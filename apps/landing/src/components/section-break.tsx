import { cn } from "@editor/ui/utils";

interface SectionBreakProps {
  className?: string;
}

export function SectionBreak({ className }: SectionBreakProps) {
  return (
    <div
      className={cn(
        "my-16 md:my-24 border-t border-border",
        className
      )}
    />
  );
}
