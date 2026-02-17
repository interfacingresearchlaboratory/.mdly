interface FinalMessageProps {
  children: React.ReactNode;
  className?: string;
}

export function FinalMessage({ children, className }: FinalMessageProps) {
  return (
    <div className={`${className || ""}`}>
      {children}
    </div>
  );
}
