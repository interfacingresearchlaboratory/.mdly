"use client"

import * as React from "react"
import {
  JSX,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { AutoLinkPlugin } from "../plugins/auto-link-plugin"
import { ClickableLinkPlugin } from "../plugins/clickable-link-plugin"
import type { LexicalEditor, NodeKey } from "lexical"
import { $createParagraphNode, $getNodeByKey } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $isColumnsNode, type ColumnsColumnCount } from "../nodes/columns-node"
import { ContentEditable } from "./content-editable"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"
import { ImagesPlugin } from "../plugins/images-plugin"
import { InlineImagePlugin } from "../plugins/inline-image-plugin"
import { DropInsertImagePlugin } from "../plugins/drop-insert-image-plugin"
import { HORIZONTAL_RULE } from "../transformers/markdown-horizontal-rule-transformer"
import { SlashCommandMenuPlugin } from "../plugins/slash-command-menu-plugin"
import { ColumnsPlugin } from "../plugins/columns-plugin"
import { Trash2Icon } from "lucide-react"

const MIN_COLUMN_FRACTION = 0.15
const DIVIDER_WIDTH_PX = 10

function normalizeWidths(widths: number[], minFrac: number): number[] {
  const clamped = widths.map((w) => Math.max(minFrac, Math.min(1, w)))
  const sum = clamped.reduce((a, b) => a + b, 0)
  if (sum <= 0) return widths.map(() => 1 / widths.length)
  return clamped.map((w) => w / sum)
}

export default function ColumnsComponent({
  nodeKey,
  columnCount,
  editors,
  widths,
}: {
  nodeKey: NodeKey
  columnCount: ColumnsColumnCount
  editors: LexicalEditor[]
  widths: number[]
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [localWidths, setLocalWidths] = useState<number[]>(() =>
    widths.length === columnCount ? widths : Array(columnCount).fill(1 / columnCount)
  )
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (widths.length === columnCount) {
      setLocalWidths(widths)
    }
  }, [widths, columnCount])

  const updateNodeWidths = useCallback(
    (newWidths: number[]) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isColumnsNode(node)) {
          node.setWidths(newWidths)
        }
      })
    },
    [editor, nodeKey]
  )

  const handleDividerMouseDown = useCallback((index: number) => {
    setDraggingIndex(index)
  }, [])

  const handleRemoveColumn = useCallback(
    (index: number) => {
      if (columnCount < 2) return
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if (!$isColumnsNode(node)) return
        if (columnCount === 2) {
          const parent = node.getParent()
          node.remove()
          if (parent && parent.getChildrenSize() === 0) {
            const paragraph = $createParagraphNode()
            parent.append(paragraph)
            paragraph.select()
          }
        } else {
          node.removeColumnAt(index)
        }
      })
    },
    [editor, nodeKey, columnCount]
  )

  useEffect(() => {
    if (draggingIndex === null || !containerRef.current) return

    const container = containerRef.current
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const cursorFrac = Math.max(0, Math.min(1, x / rect.width))
      const minLeft = (draggingIndex + 1) * MIN_COLUMN_FRACTION
      const maxLeft = 1 - (columnCount - draggingIndex - 1) * MIN_COLUMN_FRACTION
      const split = Math.max(minLeft, Math.min(maxLeft, cursorFrac))

      setLocalWidths((prev) => {
        const leftSum = prev
          .slice(0, draggingIndex + 1)
          .reduce((a, b) => a + b, 0)
        const rightSum = 1 - leftSum
        if (leftSum <= 0 || rightSum <= 0) return prev
        const next = [...prev]
        for (let i = 0; i <= draggingIndex; i++) {
          const p = prev[i]
          if (p !== undefined) next[i] = (p / leftSum) * split
        }
        for (let i = draggingIndex + 1; i < columnCount; i++) {
          const p = prev[i]
          if (p !== undefined) next[i] = (p / rightSum) * (1 - split)
        }
        return normalizeWidths(next, MIN_COLUMN_FRACTION)
      })
    }

    const onMouseUp = () => {
      setDraggingIndex(null)
      setLocalWidths((prev) => {
        const normalized = normalizeWidths(prev, MIN_COLUMN_FRACTION)
        updateNodeWidths(normalized)
        return normalized
      })
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [draggingIndex, columnCount, updateNodeWidths])

  const columnWidths =
    localWidths.length === columnCount
      ? localWidths
      : Array(columnCount).fill(1 / columnCount)

  return (
    <div
      ref={containerRef}
      contentEditable={false}
      className="EditorTheme__columns flex w-full gap-0 my-4 rounded-lg border border-border overflow-hidden bg-muted/20"
      style={{ userSelect: draggingIndex !== null ? "none" : undefined }}
    >
      {editors.slice(0, columnCount).map((columnEditor, i) => (
        <React.Fragment key={i}>
          <div
            className="EditorTheme__columnsCell group/cell relative flex flex-col min-w-0 flex-1 overflow-hidden"
            style={{
              flex: `${columnWidths[i]} ${columnWidths[i]} 0`,
              minWidth: 0,
            }}
          >
            {columnCount >= 2 && (
              <button
                type="button"
                contentEditable={false}
                aria-label="Remove column"
                className="absolute right-1 top-1 z-10 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/20 hover:opacity-100 focus:opacity-100 group-hover/cell:opacity-70"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRemoveColumn(i)
                }}
              >
                <Trash2Icon className="size-4 text-muted-foreground hover:text-destructive" />
              </button>
            )}
            <div
              className="p-3 h-full min-h-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              <LexicalNestedComposer initialEditor={columnEditor}>
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      placeholder="Type here…"
                      className="EditorTheme__columnsCellEditable relative outline-none min-h-[80px] w-full"
                      placeholderClassName="text-muted-foreground pointer-events-none absolute top-3 left-3 text-sm select-none"
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <TablePlugin />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin />
                <AutoLinkPlugin />
                <ClickableLinkPlugin />
                <ImagesPlugin />
                <InlineImagePlugin />
                <DropInsertImagePlugin />
                <MarkdownShortcutPlugin
                  transformers={[
                    CHECK_LIST,
                    HORIZONTAL_RULE,
                    ...ELEMENT_TRANSFORMERS,
                    ...MULTILINE_ELEMENT_TRANSFORMERS,
                    ...TEXT_FORMAT_TRANSFORMERS,
                    ...TEXT_MATCH_TRANSFORMERS,
                  ]}
                />
                <SlashCommandMenuPlugin />
                <ColumnsPlugin />
              </LexicalNestedComposer>
            </div>
          </div>
          {i < columnCount - 1 && (
            <div
              role="separator"
              aria-label="Resize column"
              contentEditable={false}
              className="EditorTheme__columnsDivider relative z-10 shrink-0 cursor-col-resize bg-border hover:bg-primary/30 transition-colors"
              style={{ width: DIVIDER_WIDTH_PX }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDividerMouseDown(i)
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
