"use client";

/**
 * Renders markdown with GFM (tables, task lists, etc.) and design-system components.
 * If raw HTML (e.g. rehype-raw) or user-generated markdown is ever introduced,
 * add sanitization (e.g. rehype-sanitize) to prevent XSS.
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@editor/ui/separator";
import { cn } from "@editor/ui/utils";

const proseClasses =
  "prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-medium prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-strong:font-medium";

function isExternal(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function MarkdownRenderer({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) {
  return (
    <div className={cn(proseClasses, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            const external = href ? isExternal(href) : false;
            return (
              <a
                href={href}
                {...props}
                {...(external && {
                  target: "_blank",
                  rel: "noreferrer",
                })}
              >
                {children}
              </a>
            );
          },
          code: ({ className, children, ...props }) => (
            <code
              className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-sm", className)}
              {...props}
            >
              {children}
            </code>
          ),
          pre: ({ children, ...props }) => (
            <pre
              className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm"
              {...props}
            >
              {children}
            </pre>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse border" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-muted" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
          tr: ({ children, ...props }) => (
            <tr className="border-b border-border" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border px-4 py-2 text-left font-medium" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-4 py-2" {...props}>
              {children}
            </td>
          ),
          hr: () => <Separator className="my-6" />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
