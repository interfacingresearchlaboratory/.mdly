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
import type { NodeKey } from "lexical"
import { $getNodeByKey } from "lexical"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import {
  $isHorizontalSectionBlockNode,
  type CardStyle,
  type CornerType,
  type BorderWeight,
  type HorizontalSectionCard,
} from "../nodes/horizontal-section-block-node"
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
import {
  Settings2Icon,
  PlusIcon,
  Trash2Icon,
  GripHorizontalIcon,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../../popover"
import { Button } from "../../button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select"
import { Label } from "../../label"

const MIN_CARD_HEIGHT_PX = 80
const DRAG_HANDLE_HEIGHT_PX = 8

function mergeCardStyle(
  defaultStyle: CardStyle,
  overrides?: Partial<CardStyle>
): CardStyle {
  if (!overrides) return { ...defaultStyle }
  return {
    ...defaultStyle,
    ...overrides,
  }
}

function paddingToStyle(value: CardStyle["paddingInner"]): React.CSSProperties {
  if (value === undefined) return {}
  if (typeof value === "number") {
    return { padding: `${value}px` }
  }
  const { top, right, bottom, left } = value
  return {
    paddingTop: top !== undefined ? `${top}px` : undefined,
    paddingRight: right !== undefined ? `${right}px` : undefined,
    paddingBottom: bottom !== undefined ? `${bottom}px` : undefined,
    paddingLeft: left !== undefined ? `${left}px` : undefined,
  }
}

function marginToStyle(value: CardStyle["paddingOuter"]): React.CSSProperties {
  if (value === undefined) return {}
  if (typeof value === "number") {
    return { margin: `${value}px` }
  }
  const { top, right, bottom, left } = value
  return {
    marginTop: top !== undefined ? `${top}px` : undefined,
    marginRight: right !== undefined ? `${right}px` : undefined,
    marginBottom: bottom !== undefined ? `${bottom}px` : undefined,
    marginLeft: left !== undefined ? `${left}px` : undefined,
  }
}

function cornerTypeToClass(cornerType?: CornerType): string {
  switch (cornerType) {
    case "none":
      return "rounded-none"
    case "rounded":
      return "rounded-lg"
    case "rounded-lg":
      return "rounded-xl"
    case "rounded-full":
      return "rounded-full"
    default:
      return "rounded-lg"
  }
}

function borderWeightToClass(borderWeight?: BorderWeight): string {
  switch (borderWeight) {
    case "none":
      return "border-0"
    case "super-fine":
      return "border-[1px]"
    case "thin":
      return "border"
    case "medium":
      return "border-2"
    case "thick":
      return "border-4"
    default:
      return "border-[1px]"
  }
}

function bgColorToClass(bgColor?: string): string {
  if (!bgColor || bgColor === "grey") return "bg-muted"
  if (bgColor.startsWith("bg-")) return bgColor
  return "bg-muted"
}

interface CardSettingsFormProps {
  style: CardStyle
  onChange: (style: Partial<CardStyle>) => void
  isBlockLevel?: boolean
}

function CardSettingsForm({
  style,
  onChange,
  isBlockLevel,
}: CardSettingsFormProps): JSX.Element {
  const paddingInner = style.paddingInner
  const paddingOuter = style.paddingOuter
  const innerNum =
    typeof paddingInner === "number"
      ? paddingInner
      : paddingInner
        ? paddingInner.top ?? 12
        : 12
  const outerNum =
    typeof paddingOuter === "number"
      ? paddingOuter
      : paddingOuter
        ? paddingOuter.top ?? 0
        : 0

  return (
    <div className="grid gap-3 min-w-[200px]">
      {isBlockLevel && (
        <p className="text-xs text-muted-foreground">
          Apply to all cards in this block.
        </p>
      )}
      <div className="grid gap-2">
        <Label>Corner type</Label>
        <Select
          value={style.cornerType ?? "rounded"}
          onValueChange={(v) => onChange({ cornerType: v as CornerType })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sharp</SelectItem>
            <SelectItem value="rounded">Rounded</SelectItem>
            <SelectItem value="rounded-lg">Large</SelectItem>
            <SelectItem value="rounded-full">Pill</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Border weight</Label>
        <Select
          value={style.borderWeight ?? "super-fine"}
          onValueChange={(v) => onChange({ borderWeight: v as BorderWeight })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="super-fine">Super fine</SelectItem>
            <SelectItem value="thin">Thin</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="thick">Thick</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Background</Label>
        <Select
          value={style.bgColor ?? "grey"}
          onValueChange={(v) => onChange({ bgColor: v })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grey">Grey</SelectItem>
            <SelectItem value="bg-muted/50">Light grey</SelectItem>
            <SelectItem value="bg-background">Background</SelectItem>
            <SelectItem value="bg-card">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Internal padding (px)</Label>
        <input
          type="number"
          min={0}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={innerNum}
          onChange={(e) =>
            onChange({ paddingInner: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div className="grid gap-2">
        <Label>External padding (px)</Label>
        <input
          type="number"
          min={0}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={outerNum}
          onChange={(e) =>
            onChange({ paddingOuter: Number(e.target.value) || 0 })
          }
        />
      </div>
    </div>
  )
}

export default function HorizontalSectionBlockComponent({
  nodeKey,
  defaultStyle,
  cards,
}: {
  nodeKey: NodeKey
  defaultStyle: CardStyle
  cards: HorizontalSectionCard[]
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [localHeights, setLocalHeights] = useState<number[]>(() =>
    cards.map((c) => c.minHeightPx ?? MIN_CARD_HEIGHT_PX)
  )
  const [draggingCardIndex, setDraggingCardIndex] = useState<number | null>(
    null
  )
  const [draggingEdge, setDraggingEdge] = useState<"top" | "bottom" | null>(
    null
  )
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)

  const cardHeightsKey = cards.map((c) => c.minHeightPx).join(",")
  useEffect(() => {
    setLocalHeights(
      cards.map((c) => c.minHeightPx ?? MIN_CARD_HEIGHT_PX)
    )
    // cards identity changes often; cardHeightsKey + cards.length avoid unnecessary runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, cardHeightsKey])

  const updateCardHeight = useCallback(
    (index: number, heightPx: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isHorizontalSectionBlockNode(node)) {
          node.setCardMinHeightAt(index, Math.max(MIN_CARD_HEIGHT_PX, heightPx))
        }
      })
    },
    [editor, nodeKey]
  )

  const handleDragStart = useCallback(
    (index: number, edge: "top" | "bottom", clientY: number) => {
      setDraggingCardIndex(index)
      setDraggingEdge(edge)
      dragStartY.current = clientY
      dragStartHeight.current = localHeights[index] ?? MIN_CARD_HEIGHT_PX
    },
    [localHeights]
  )

  useEffect(() => {
    if (
      draggingCardIndex === null ||
      draggingEdge === null ||
      draggingCardIndex < 0 ||
      draggingCardIndex >= localHeights.length
    )
      return

    const onMouseMove = (e: MouseEvent) => {
      const dy = e.clientY - dragStartY.current
      const delta = draggingEdge === "bottom" ? dy : -dy
      const newHeight = Math.max(
        MIN_CARD_HEIGHT_PX,
        dragStartHeight.current + delta
      )
      setLocalHeights((prev) => {
        const next = [...prev]
        next[draggingCardIndex] = newHeight
        return next
      })
    }

    const onMouseUp = () => {
      setLocalHeights((prev) => {
        const h = prev[draggingCardIndex]
        if (h !== undefined) {
          updateCardHeight(draggingCardIndex, h)
        }
        return prev
      })
      setDraggingCardIndex(null)
      setDraggingEdge(null)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [
    draggingCardIndex,
    draggingEdge,
    localHeights.length,
    updateCardHeight,
  ])

  const setBlockDefaultStyle = useCallback(
    (style: Partial<CardStyle>) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isHorizontalSectionBlockNode(node)) {
          node.setDefaultStyle(style)
        }
      })
    },
    [editor, nodeKey]
  )

  const setCardStyleAt = useCallback(
    (index: number, overrides: Partial<CardStyle> | null) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isHorizontalSectionBlockNode(node)) {
          node.setCardStyleAt(index, overrides ?? null)
        }
      })
    },
    [editor, nodeKey]
  )

  const addCard = useCallback(
    (index?: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isHorizontalSectionBlockNode(node)) {
          node.addCard(index)
        }
      })
    },
    [editor, nodeKey]
  )

  const removeCardAt = useCallback(
    (index: number) => {
      if (cards.length <= 1) return
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isHorizontalSectionBlockNode(node)) {
          node.removeCardAt(index)
        }
      })
    },
    [editor, nodeKey, cards.length]
  )

  const isDragging = draggingCardIndex !== null

  return (
    <div
      contentEditable={false}
      className="EditorTheme__horizontalSectionBlock my-4 flex w-full flex-col gap-0"
      style={{ userSelect: isDragging ? "none" : undefined }}
    >
      {/* Block-level settings */}
      <div className="mb-1 flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Edit block settings"
            >
              <Settings2Icon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <CardSettingsForm
              style={defaultStyle}
              onChange={setBlockDefaultStyle}
              isBlockLevel
            />
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label="Add card"
          onClick={() => addCard()}
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {cards.map((card, index) => {
        const merged = mergeCardStyle(defaultStyle, card.styleOverrides)
        const roundedClass = cornerTypeToClass(merged.cornerType)
        const borderClass = borderWeightToClass(merged.borderWeight)
        const bgClass = bgColorToClass(merged.bgColor)
        const heightPx = localHeights[index] ?? card.minHeightPx ?? MIN_CARD_HEIGHT_PX

        return (
          <div
            key={index}
            className="EditorTheme__horizontalSectionBlockCard group/card flex flex-col"
            style={marginToStyle(merged.paddingOuter)}
          >
            {/* Top drag handle */}
            <div
              role="separator"
              aria-label="Resize card height"
              className="flex shrink-0 cursor-n-resize items-center justify-center transition-colors hover:bg-primary/20"
              style={{ height: DRAG_HANDLE_HEIGHT_PX, minHeight: DRAG_HANDLE_HEIGHT_PX }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDragStart(index, "top", e.clientY)
              }}
            >
              <GripHorizontalIcon className="size-3.5 text-muted-foreground opacity-0 group-hover/card:opacity-100" />
            </div>

            <div
              className={`EditorTheme__horizontalSectionBlockCardInner border-border ${roundedClass} ${borderClass} ${bgClass} border`}
              style={{
                minHeight: heightPx,
                ...paddingToStyle(merged.paddingInner),
              }}
            >
              <div
                className="relative flex h-full min-h-0 flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative flex-1">
                  {cards.length >= 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 z-10 h-7 w-7 opacity-0 transition-opacity group-hover/card:opacity-70 hover:opacity-100"
                      aria-label="Remove card"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeCardAt(index)
                      }}
                    >
                      <Trash2Icon className="size-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-8 top-1 z-10 h-7 w-7 opacity-0 transition-opacity group-hover/card:opacity-70 hover:opacity-100"
                        aria-label="Card settings"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings2Icon className="size-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-auto">
                      <CardSettingsForm
                        style={merged}
                        onChange={(s) =>
                          setCardStyleAt(index, { ...card.styleOverrides, ...s })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <LexicalNestedComposer initialEditor={card.editor}>
                    <RichTextPlugin
                      contentEditable={
                        <ContentEditable
                          placeholder="Type here…"
                          className="EditorTheme__horizontalSectionBlockCardEditable relative min-h-[60px] w-full outline-none"
                          placeholderClassName="text-muted-foreground pointer-events-none absolute left-0 top-0 text-sm select-none"
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
            </div>

            {/* Bottom drag handle */}
            <div
              role="separator"
              aria-label="Resize card height"
              className="flex shrink-0 cursor-n-resize items-center justify-center transition-colors hover:bg-primary/20"
              style={{ height: DRAG_HANDLE_HEIGHT_PX, minHeight: DRAG_HANDLE_HEIGHT_PX }}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDragStart(index, "bottom", e.clientY)
              }}
            >
              <GripHorizontalIcon className="size-3.5 text-muted-foreground opacity-0 group-hover/card:opacity-100" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
