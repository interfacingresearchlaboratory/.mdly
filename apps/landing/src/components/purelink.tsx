import Link from "next/link";

interface PureLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function PureLink({ href, children, className }: PureLinkProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  
  if (isExternal) {
    return (
      <a
        href={href}
        className={`text-muted-foreground hover:text-foreground transition-colors ${className || ""}`}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link
      href={href}
      className={`text-muted-foreground hover:text-foreground transition-colors ${className || ""}`}
    >
      {children}
    </Link>
  );
}
