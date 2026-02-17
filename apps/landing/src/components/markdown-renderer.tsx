"use client";

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ markdown, className }: { markdown: string; className?: string }) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Enhance external links
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const links = el.querySelectorAll('a[href^="http"]');
    links.forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noreferrer');
    });
  }, [markdown]);

  return (
    <div
      ref={contentRef}
      className={`prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-medium prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-strong:font-medium ${className || ''}`}
    >
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
