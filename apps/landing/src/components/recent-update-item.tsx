import Link from "next/link";

interface RecentUpdateItemProps {
  title: string;
  date: string;
  version?: string;
  description?: string;
  href: string;
}

export function RecentUpdateItem({
  title,
  date,
  version,
  description,
  href,
}: RecentUpdateItemProps) {
  return (
    <Link
      href={href}
      className="group block py-4 px-2 transition-all duration-200 hover:bg-accent/10 hover:translate-x-1">
      <div className="flex items-center gap-2 mb-1">
        <time className="text-sm text-muted-foreground">{date}</time>
        {version && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-foreground border border-border rounded">
            {version}
          </span>
        )}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-tight">
          {description}
        </p>
      )}
      <span className="text-sm text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1 mt-2 transition-colors duration-200">
        Read more
        <span className="text-lg inline-block group-hover:translate-x-0.5 transition-transform duration-200">→</span>
      </span>
    </Link>
  );
}
