import { cn } from "@editor/ui/utils";

interface SectionBufferProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "green-dashed" | "red-dashed";
  className?: string;
}

const sizeClasses = {
  sm: "py-8 md:py-12",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-48",
};

const variantFills: Record<string, string> = {
  default: "",
  "green-dashed":
    "bg-green-50/30 dark:bg-green-950/20 [background-image:repeating-linear-gradient(0deg,transparent,transparent_7px,rgba(34,197,94,0.2)_7px,rgba(34,197,94,0.2)_8px)]",
  "red-dashed":
    "bg-red-50/30 dark:bg-red-950/20 [background-image:repeating-linear-gradient(0deg,transparent,transparent_7px,rgba(239,68,68,0.2)_7px,rgba(239,68,68,0.2)_8px)]",
};

export function SectionBuffer({ size = "md", variant = "default", className }: SectionBufferProps) {
  return (
    <div
      className={cn(
        "border-x border-border relative flex flex-col justify-center",
        sizeClasses[size],
        variantFills[variant],
        className
      )}
      aria-hidden
    >
      {variant === "default" ? (
        <div className="absolute left-1/2 top-1/2 -ml-[50vw] -translate-y-px w-screen border-t border-dashed border-border" />
      ) : (
        <>
          <div className="absolute top-1/2 right-full -translate-y-px w-[50vw] border-t border-dashed border-border" />
          <div className="absolute top-1/2 left-full -translate-y-px w-[50vw] border-t border-dashed border-border" />
        </>
      )}
    </div>
  );
}
