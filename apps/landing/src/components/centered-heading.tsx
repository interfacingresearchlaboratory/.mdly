interface CenteredHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function CenteredHeading({ children, className }: CenteredHeadingProps) {
  return (
    <div className={`text-center ${className || ""}`}>
      {children}
    </div>
  );
}
