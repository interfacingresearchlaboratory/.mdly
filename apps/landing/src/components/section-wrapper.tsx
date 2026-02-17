import { cn } from "@editor/ui/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  variant?: "light" | "medium" | "medium-hash" | "dark" | "bordered" | "bordered-hash" | "bordered-hash-alt";
  className?: string;
}

const variantStyles: Record<string, string> = {
  bordered: "border-x border-border",
  "bordered-hash": "border-x border-border",
  "bordered-hash-alt": "border-x border-border",
  light: "bg-white dark:bg-gray-950/50",
  medium: "bg-blue-50/30 dark:bg-blue-950/20",
  "medium-hash": "bg-blue-50/30 dark:bg-blue-950/20",
  dark: "bg-slate-50/40 dark:bg-slate-950/30",
};

const fullBleedHash =
  "bg-blue-50/30 dark:bg-blue-950/20 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(107,114,128,0.25)_4px,rgba(107,114,128,0.25)_5px)]";

const blueHash =
  "bg-blue-50/30 dark:bg-blue-950/20 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(107,114,128,0.25)_4px,rgba(107,114,128,0.25)_5px)]";

const orangeHash =
  "bg-orange-50/30 dark:bg-orange-950/20 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(107,114,128,0.25)_4px,rgba(107,114,128,0.25)_5px)]";

export function SectionWrapper({ children, variant = "light", className }: SectionWrapperProps) {
  return (
    <div className={cn("relative", variantStyles[variant], className)}>
      {/* Full-bleed hash only; content stays within page margins */}
      {variant === "medium-hash" && (
        <div
          className={cn(
            "absolute inset-y-0 left-1/2 -ml-[50vw] w-screen pointer-events-none z-0",
            fullBleedHash
          )}
          aria-hidden
        />
      )}
      {/* Split gutters: blue left, orange right */}
      {variant === "bordered-hash" && (
        <>
          <div
            className={cn(
              "absolute inset-y-0 right-full w-[50vw] pointer-events-none z-0",
              blueHash
            )}
            aria-hidden
          />
          <div
            className={cn(
              "absolute inset-y-0 left-full w-[50vw] pointer-events-none z-0",
              orangeHash
            )}
            aria-hidden
          />
        </>
      )}
      {/* Split gutters: orange left, blue right */}
      {variant === "bordered-hash-alt" && (
        <>
          <div
            className={cn(
              "absolute inset-y-0 right-full w-[50vw] pointer-events-none z-0",
              orangeHash
            )}
            aria-hidden
          />
          <div
            className={cn(
              "absolute inset-y-0 left-full w-[50vw] pointer-events-none z-0",
              blueHash
            )}
            aria-hidden
          />
        </>
      )}
      <div
        className={cn(
          "relative z-10",
          (variant === "bordered" || variant === "bordered-hash" || variant === "bordered-hash-alt") && "py-0",
          (variant === "medium-hash" || variant === "light") && "py-24 border-x border-border"
        )}
      >
        {variant === "medium-hash" && (
          <div
            className="absolute left-1/2 top-0 bottom-0 w-0 border-l border-border -translate-x-px pointer-events-none"
            aria-hidden
          />
        )}
        {children}
      </div>
    </div>
  );
}
