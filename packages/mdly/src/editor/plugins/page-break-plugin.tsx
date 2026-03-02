"use client";

import { useEffect, useRef } from "react";
import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

const PAGE_BREAK_MARGIN_ATTR = "data-page-break-margin";

export interface PageBreakConfig {
  pageHeight: number;
  pageGap: number;
  topMargin: number;
  bottomMargin: number;
  onPageCountChange?: (count: number) => void;
}

/**
 * Lexical plugin that enforces page boundaries in paper view.
 * Adds margin-top to blocks that would cross a page boundary, pushing them
 * to the next page's printable area. Reports the total page count for
 * container height snapping.
 */
export function PageBreakPlugin({
  pageHeight,
  pageGap,
  topMargin,
  bottomMargin,
  onPageCountChange,
}: PageBreakConfig): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const rafRef = useRef<number | null>(null);
  const lastPageCountRef = useRef<number>(1);

  useEffect(() => {
    const runPageBreakPass = () => {
      const rootElement = editor.getRootElement();
      const container = rootElement?.closest<HTMLElement>("[data-paper-container]");
      if (!rootElement || !container) return;

      const pageSlot = pageHeight + pageGap;

      // Get direct children of the Lexical root (block-level elements)
      const blocks = Array.from(rootElement.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement
      );

      // Clear previous page-break margins
      for (const block of blocks) {
        if (block.hasAttribute(PAGE_BREAK_MARGIN_ATTR)) {
          block.style.removeProperty("margin-top");
          block.removeAttribute(PAGE_BREAK_MARGIN_ATTR);
        }
      }

      const containerRect = container.getBoundingClientRect();
      let maxPageIndex = 0;

      for (const block of blocks) {
        const blockRect = block.getBoundingClientRect();
        const blockTop = blockRect.top - containerRect.top;
        const blockHeight = blockRect.height;
        const blockBottom = blockTop + blockHeight;

        // Which page does this block start on?
        const pageIndex = Math.floor(blockTop / pageSlot);
        const pageStart = pageIndex * pageSlot;
        const printableEnd = pageStart + pageHeight - bottomMargin;

        // If block extends past the printable end, push entire block to next page
        if (blockBottom > printableEnd) {
          const nextPageStart = (pageIndex + 1) * pageSlot + topMargin;
          const extra = nextPageStart - blockTop;
          block.style.marginTop = `${extra}px`;
          block.setAttribute(PAGE_BREAK_MARGIN_ATTR, "true");

          const newPageIndex = pageIndex + 1;
          maxPageIndex = Math.max(maxPageIndex, newPageIndex);
        } else {
          maxPageIndex = Math.max(maxPageIndex, pageIndex);
        }
      }

      // Compute page count from actual content height (handles overflow from tall blocks)
      const contentHeight = container.scrollHeight;
      const pagesFromHeight = Math.ceil((contentHeight + pageGap) / pageSlot);
      const pageCount = Math.max(1, Math.max(maxPageIndex + 1, pagesFromHeight));

      if (pageCount !== lastPageCountRef.current) {
        lastPageCountRef.current = pageCount;
        onPageCountChange?.(pageCount);
      }
    };

    const schedulePass = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        runPageBreakPass();
      });
    };

    const resizeObserver = new ResizeObserver(schedulePass);
    const rootElement = editor.getRootElement();
    if (rootElement) {
      resizeObserver.observe(rootElement);
    }

    const removeUpdateListener = editor.registerUpdateListener(() => {
      schedulePass();
    });

    // Initial pass
    schedulePass();

    return () => {
      removeUpdateListener();
      resizeObserver.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [
    editor,
    pageHeight,
    pageGap,
    topMargin,
    bottomMargin,
    onPageCountChange,
  ]);

  return null;
}
