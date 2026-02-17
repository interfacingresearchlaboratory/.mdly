interface SpacedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function SpacedSection({ children, className }: SpacedSectionProps) {
  return (
    <div className={`not-prose my-48 space-y-16 [&:first-child]:mt-6 text-center ${className || ""}`}>
      {children}
    </div>
  );
}
