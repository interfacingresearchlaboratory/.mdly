import { cn } from "@editor/ui/utils";

interface FeatureCardProps {
  title: string;
  children: React.ReactNode;
  mockup?: React.ReactNode;
  className?: string;
}

export function FeatureCard({ title, children, mockup, className }: FeatureCardProps) {
  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* Mockup card */}
      {mockup && (
        <div
          className={cn(
            "w-full rounded-lg border border-border bg-background overflow-hidden transition-colors",
            "hover:border-primary/50",
            "min-h-[300px] md:min-h-[400px]"
          )}
        >
          <div className="relative w-full h-full overflow-hidden bg-muted/20">
            <div className="absolute inset-0 w-full h-full">
              <div className="w-full h-full flex items-center justify-center">
                {mockup}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Text below card, aligned left */}
      {mockup && (
        <div className="text-left">
          <h3 className="text-xl font-medium mb-3 text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="text-muted-foreground space-y-2 prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      )}
      
      {/* Fallback if no mockup */}
      {!mockup && (
        <div
          className={cn(
            "w-full rounded-lg border border-border bg-background p-6 flex flex-col flex-1",
            "hover:border-primary/50"
          )}
        >
          <h3 className="text-xl font-medium mb-3 text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="text-muted-foreground space-y-2 prose prose-sm dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
