"use client";

import { useState } from "react";
import { Button } from "@editor/ui/button";
import { Copy, Check } from "lucide-react";

interface CopyMarkdownButtonProps {
  slug: string[];
}

export function CopyMarkdownButton({ slug }: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const slugPath = slug.length > 0 ? slug.join("/") : "";
      const response = await fetch(`/api/markdown?slug=${encodeURIComponent(slugPath)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch markdown");
      }
      const { content } = await response.json();
      
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy markdown:", error);
    }
  };

  return (
    <div className="mb-8 pb-8 border-b">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Markdown
          </>
        )}
      </Button>
    </div>
  );
}
