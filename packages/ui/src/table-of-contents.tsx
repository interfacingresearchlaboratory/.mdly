"use client";

import { useEffect, useState, useRef } from "react";
import { TableOfContents as TocIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Kbd } from "./kbd";
import { cn } from "./lib/utils";

/** Hotkey to toggle TOC visibility: ⌘+\ */
const TOC_TOGGLE_HOTKEY = { meta: true, key: "\\" };

export type TableOfContentsEntry = {
  id: string;
  text: string;
  level: number;
};

type TableOfContentsProps = {
  /** CSS selector for the element that contains the headings (e.g. "[data-toc-content]"). */
  contentSelector: string;
  className?: string;
  /** Shown when no headings are found. Default: "No headings" */
  emptyMessage?: string;
  /** Accessible label for the nav. Default: "Contents" */
  title?: string;
};

function getHeadingLevel(tagName: string | undefined): number {
  const s = tagName ?? "H1";
  const match = /^H([1-6])$/i.exec(s);
  return match ? parseInt(match[1] ?? "1", 10) : 1;
}

/** Slug for heading text: lowercase, spaces to hyphens, alphanumeric + hyphens only. */
function slugFromText(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return slug || "untitled";
}

/** Offset so scrolled-into-view headings sit below fixed/sticky header (e.g. top-20). */
const SCROLL_MARGIN_TOP = "5rem";

function scanHeadings(root: Element): TableOfContentsEntry[] {
  const headings = root.querySelectorAll("h1, h2, h3, h4");
  const entries: TableOfContentsEntry[] = [];
  headings.forEach((el, index) => {
    const text = (el.textContent ?? "").trim();
    const slug = slugFromText(text);
    const id = `toc-${slug}-${index}`;
    el.id = id;
    const htmlEl = el as HTMLElement;
    if (htmlEl.style) {
      htmlEl.style.scrollMarginTop = SCROLL_MARGIN_TOP;
    }
    const level = getHeadingLevel(el.tagName);
    entries.push({ id, text, level });
  });
  return entries;
}

const DEBOUNCE_MS = 100;

/** Delay per letter for typewriter effect (ms). */
const TYPEWRITER_DELAY_MS = 40;

function isTypingElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = (el as HTMLElement).tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable === true
  );
}

export function TableOfContents({
  contentSelector,
  className,
  emptyMessage = "No headings",
  title = "Contents",
}: TableOfContentsProps) {
  const [entries, setEntries] = useState<TableOfContentsEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(true);
  const [titleVisibleCount, setTitleVisibleCount] = useState(() => title.length);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const titleLength = title.length;

  useEffect(() => {
    if (isOpen && !exiting) {
      setTitleVisibleCount((prev) => Math.min(prev, titleLength));
    }
  }, [titleLength, isOpen, exiting]);

  useEffect(() => {
    if (isOpen && !exiting && titleVisibleCount < titleLength) {
      const t = setTimeout(
        () => setTitleVisibleCount((prev) => Math.min(prev + 1, titleLength)),
        TYPEWRITER_DELAY_MS
      );
      return () => clearTimeout(t);
    }
  }, [isOpen, exiting, titleVisibleCount, titleLength]);

  useEffect(() => {
    if (exiting && titleVisibleCount > 0) {
      const t = setTimeout(
        () => setTitleVisibleCount((prev) => Math.max(prev - 1, 0)),
        TYPEWRITER_DELAY_MS
      );
      return () => clearTimeout(t);
    }
  }, [exiting, titleVisibleCount]);

  const toggle = () => {
    if (isOpen) {
      setTitleVisibleCount(titleLength);
      setExiting(true);
    } else {
      setTitleVisibleCount(0);
      setEntered(false);
      setIsOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
    }
  };

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(() => {
      setIsOpen(false);
      setExiting(false);
    }, 200);
    return () => clearTimeout(t);
  }, [exiting]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingElement(document.activeElement)) return;
      const metaMatch = TOC_TOGGLE_HOTKEY.meta && (e.metaKey || e.ctrlKey);
      const keyMatch = e.key === TOC_TOGGLE_HOTKEY.key;
      if (metaMatch && keyMatch) {
        e.preventDefault();
        if (isOpen) {
          setExiting(true);
        } else {
          setEntered(false);
          setIsOpen(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setEntered(true));
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    function runScan() {
      const root = document.querySelector(contentSelector);
      if (!root) {
        setEntries([]);
        return;
      }
      setEntries(scanHeadings(root));
    }

    runScan();

    const root = document.querySelector(contentSelector);
    if (!root) return;

    const scheduleScan = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        runScan();
      }, DEBOUNCE_MS);
    };

    const observer = new MutationObserver(scheduleScan);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
    });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [contentSelector]);

  const paddingByLevel: Record<number, string> = {
    1: "pl-0",
    2: "pl-3",
    3: "pl-6",
    4: "pl-8",
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showContent = isOpen || exiting;
  const toggleButton = (
    <button
      type="button"
      onClick={toggle}
      className="w-fit shrink-0 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={isOpen ? "Hide table of contents" : "Show table of contents"}
      aria-expanded={isOpen}
    >
      <TocIcon className="size-4" />
    </button>
  );

  if (!showContent) {
    return (
      <nav aria-label={title} className={cn("flex flex-col p-3", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex items-center gap-2">
                <span>Show table of contents</span>
                <span className="flex items-center gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>{"\\"}</Kbd>
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    );
  }

  return (
    <nav
      aria-label={title}
      className={cn("flex flex-col p-3", className)}
    >
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title.slice(0, titleVisibleCount)}
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{toggleButton}</TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex items-center gap-2">
                <span>Hide table of contents</span>
                <span className="flex items-center gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>{"\\"}</Kbd>
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        className={cn(
          "min-h-0 overflow-y-auto max-h-[calc(100vh-10rem)] transition-all duration-200",
          exiting && "opacity-0 -translate-x-2",
          isOpen && !exiting && (entered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")
        )}
      >
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {entries.map((entry) => (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  onClick={(e) => handleLinkClick(e, entry.id)}
                  className={cn(
                    "block py-0.5 text-muted-foreground hover:text-foreground truncate transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
                    paddingByLevel[entry.level] ?? "pl-0"
                  )}
                >
                  {entry.text || "(Untitled)"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
