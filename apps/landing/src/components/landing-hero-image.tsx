import { cn } from "@editor/ui/utils";

interface LandingHeroImageProps {
  className?: string;
  children?: React.ReactNode;
}

export function LandingHeroImage({ className, children }: LandingHeroImageProps) {
  return (
    <div className={cn("not-prose mb-20 w-full", className)}>
      <div className="w-full rounded-lg overflow-hidden">
        {children || (
          <div className="w-full min-h-[600px] bg-muted flex items-center justify-center text-muted-foreground">
            Hero Image Placeholder
          </div>
        )}
      </div>
    </div>
  );
}
