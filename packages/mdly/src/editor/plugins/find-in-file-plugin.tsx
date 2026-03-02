"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getNodeByKey,
  $isTextNode,
  $isElementNode,
  $createRangeSelection,
  $setSelection,
} from "lexical";
import type { ElementNode, TextNode } from "lexical";
import { useFindInFileContext } from "../context/find-in-file-context";
import { buildFindRegex } from "../utils/find-in-file-search";

export interface FindMatch {
  nodeKey: string;
  startOffset: number;
  endOffset: number;
}

function walkTextNodes(
  node: import("lexical").LexicalNode,
  query: string,
  caseSensitive: boolean,
  wholeWord: boolean,
  out: FindMatch[]
): void {
  if ($isTextNode(node)) {
    const textNode = node as TextNode;
    const text = textNode.getTextContent();
    const regex = buildFindRegex(query, caseSensitive, wholeWord);
    if (!regex) return;
    let m: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((m = regex.exec(text)) !== null) {
      out.push({
        nodeKey: textNode.getKey(),
        startOffset: m.index,
        endOffset: m.index + m[0].length,
      });
    }
    return;
  }
  if ($isElementNode(node)) {
    for (const child of (node as ElementNode).getChildren()) {
      walkTextNodes(child, query, caseSensitive, wholeWord, out);
    }
  }
}

function getTextNodeDomRange(
  editor: import("lexical").LexicalEditor,
  nodeKey: string,
  startOffset: number,
  endOffset: number
): Range | null {
  const el = editor.getElementByKey(nodeKey);
  if (!el) return null;
  const textNode =
    el.nodeType === Node.TEXT_NODE
      ? el
      : el.firstChild?.nodeType === Node.TEXT_NODE
        ? el.firstChild
        : null;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null;
  const range = document.createRange();
  try {
    range.setStart(textNode, Math.min(startOffset, textNode.textContent?.length ?? 0));
    range.setEnd(textNode, Math.min(endOffset, textNode.textContent?.length ?? 0));
  } catch {
    return null;
  }
  return range;
}

export function FindInFilePlugin({ paneId }: { paneId: string }): ReactNode {
  const [editor] = useLexicalComposerContext();
  const findContext = useFindInFileContext();
  const matchesRef = useRef<FindMatch[]>([]);
  const [highlightRects, setHighlightRects] = useState<{ top: number; left: number; width: number; height: number }[]>([]);
  const [currentMatchRect, setCurrentMatchRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const isActive = findContext != null && findContext.focusedPaneId === paneId && findContext.isOpen;
  const currentIndex = findContext?.currentIndex ?? -1;

  const updateMatches = useCallback(() => {
    if (!findContext || !isActive || findContext.query.length === 0) {
      matchesRef.current = [];
      findContext?.setTotalMatches(0);
      setHighlightRects([]);
      return;
    }
    const matches: FindMatch[] = [];
    editor.getEditorState().read(() => {
      const root = $getRoot();
      for (const child of root.getChildren()) {
        walkTextNodes(
          child,
          findContext.query,
          findContext.caseSensitive,
          findContext.wholeWord,
          matches
        );
      }
    });
    matchesRef.current = matches;
    findContext.setTotalMatches(matches.length);
    if (findContext.currentIndex >= matches.length && matches.length > 0) {
      findContext.setCurrentIndex(0);
    }
  }, [editor, findContext, isActive]);

  useEffect(() => {
    if (!findContext || !isActive) return;
    updateMatches();
    return editor.registerUpdateListener(() => {
      updateMatches();
    });
  }, [editor, findContext, isActive, updateMatches]);

  useEffect(() => {
    if (!findContext || !isActive || findContext.query.length === 0) {
      setHighlightRects([]);
      setCurrentMatchRect(null);
      return;
    }
    const root = editor.getRootElement();
    if (!root) {
      setHighlightRects([]);
      setCurrentMatchRect(null);
      return;
    }
    const computeRects = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const overlayBounds = overlay.getBoundingClientRect();
      const matches = matchesRef.current;
      const currentIndex = findContext.currentIndex;
      const rects: { top: number; left: number; width: number; height: number }[] = [];
      let currentRect: { top: number; left: number; width: number; height: number } | null = null;
      for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        if (!m) continue;
        const range = getTextNodeDomRange(editor, m.nodeKey, m.startOffset, m.endOffset);
        if (!range) continue;
        const r = range.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const rect = {
          top: r.top - overlayBounds.top,
          left: r.left - overlayBounds.left,
          width: r.width,
          height: r.height,
        };
        if (i === currentIndex) {
          currentRect = rect;
        } else {
          rects.push(rect);
        }
      }
      setHighlightRects(rects);
      setCurrentMatchRect(currentRect);
    };
    const raf = requestAnimationFrame(computeRects);
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(computeRects));
    const onScroll = () => requestAnimationFrame(computeRects);
    root.addEventListener("scroll", onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(computeRects));
    resizeObserver.observe(root);
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
      root.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [
    editor,
    findContext?.query,
    findContext?.caseSensitive,
    findContext?.wholeWord,
    findContext?.currentIndex,
    isActive,
    findContext,
  ]);

  // Only select and scroll when user navigates (prev/next), not when query changes.
  // Running on every keystroke would steal focus from the find input.
  useEffect(() => {
    if (!isActive) return;
    const matches = matchesRef.current;
    const idx = currentIndex;
    if (idx < 0 || idx >= matches.length) return;
    const match = matches[idx];
    if (!match) return;
    editor.update(
      () => {
        const node = $getNodeByKey(match.nodeKey);
        if (!$isTextNode(node)) return;
        const selection = $createRangeSelection();
        selection.setTextNodeRange(
          node as TextNode,
          match.startOffset,
          node as TextNode,
          match.endOffset
        );
        $setSelection(selection);
      },
      { discrete: true }
    );
    const el = editor.getElementByKey(match.nodeKey);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [editor, currentIndex, isActive]);

  if (!findContext || !isActive) return null;

  const root = editor.getRootElement();
  if (!root) return null;

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="relative w-full h-full">
        {highlightRects.map((rect, i) => (
          <div
            key={`other-${rect.top}-${rect.left}-${i}`}
            className="absolute bg-yellow-200/50 dark:bg-yellow-900/40 rounded-sm"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
        ))}
        {currentMatchRect ? (
          <div
            className="absolute rounded-sm bg-blue-200/70 dark:bg-blue-800/60 ring-1 ring-blue-400/50 dark:ring-blue-500/50"
            style={{
              top: currentMatchRect.top,
              left: currentMatchRect.left,
              width: currentMatchRect.width,
              height: currentMatchRect.height,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
