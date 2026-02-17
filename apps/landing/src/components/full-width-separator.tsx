import { cn } from "@editor/ui/utils";
import { Separator } from "@editor/ui/separator";

interface FullWidthSeparatorProps {
  className?: string;
}

export function FullWidthSeparator({ className }: FullWidthSeparatorProps) {
  return (
    <div
      className={cn("w-screen relative left-1/2 -ml-[50vw]", className)}
    >
      <Separator />
    </div>
  );
}
