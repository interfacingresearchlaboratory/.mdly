import { cn } from "@editor/ui/utils";

interface HeroHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroHeading({ children, className }: HeroHeadingProps) {
  return (
    <div className={cn("hero-heading space-y-0 text-left mb-12 md:mb-16 [&>h2]:mt-0 [&>h2]:mb-0 [&>h2]:!text-5xl [&>h2]:md:!text-6xl [&>h2]:lg:!text-7xl [&>h2]:!font-regular [&>h2]:!leading-none [&>h2]:first-child:mb-1 text-[#0101fd]", className)}>
      {children}
    </div>
  );
}
