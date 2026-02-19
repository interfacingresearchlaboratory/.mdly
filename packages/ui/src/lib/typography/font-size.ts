import type { EditorThemeClasses } from "lexical"

/**
 * Per-slot font size config (same shape as letter spacing).
 * Values are Tailwind text-size classes (e.g. "text-sm", "text-lg", "text-[16px]").
 */
export interface FontSizeTypographyConfig {
  heading?: Partial<Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", string>>
  paragraph?: string
  quote?: string
  code?: string
  listitem?: string
  tableCell?: string
  tableCellHeader?: string
  text?: Partial<
    Record<
      "bold" | "italic" | "code" | "underline" | "strikethrough" | "underlineStrikethrough",
      string
    >
  >
  codeHighlight?: string
}

function appendClass(base: string, extra: string): string {
  if (!extra.trim()) return base
  return base ? `${base} ${extra}` : extra
}

/** Strip Tailwind text-* (font-size/line-height) classes from a class string. */
function stripTextSizeClass(className: string): string {
  return className
    .replace(/\btext-\S+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function appendFontSizeClass(base: string, sizeClass: string): string {
  if (!sizeClass.trim()) return base
  const without = stripTextSizeClass(base)
  return without ? `${without} ${sizeClass}` : sizeClass
}

/**
 * Merges per-slot font-size overrides into a Lexical theme.
 * Replaces any existing text-* class on the slot with the configured one.
 */
export function mergeFontSizeIntoTheme(
  baseTheme: EditorThemeClasses,
  config: FontSizeTypographyConfig
): EditorThemeClasses {
  if (!config || Object.keys(config).length === 0) {
    return baseTheme
  }

  const result = { ...baseTheme } as EditorThemeClasses

  if (config.heading && baseTheme.heading) {
    result.heading = { ...baseTheme.heading }
    for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
      const value = config.heading[tag]
      if (value && result.heading[tag]) {
        result.heading[tag] = appendFontSizeClass(
          baseTheme.heading[tag] ?? "",
          value
        )
      }
    }
  }

  if (config.paragraph && baseTheme.paragraph) {
    result.paragraph = appendFontSizeClass(baseTheme.paragraph, config.paragraph)
  }

  if (config.quote && baseTheme.quote) {
    result.quote = appendFontSizeClass(baseTheme.quote, config.quote)
  }

  if (config.code && baseTheme.code) {
    result.code = appendFontSizeClass(baseTheme.code, config.code)
  }

  if (config.listitem && baseTheme.list?.listitem) {
    result.list = { ...baseTheme.list }
    result.list.listitem = appendFontSizeClass(
      baseTheme.list.listitem,
      config.listitem
    )
  }

  if (config.tableCell && baseTheme.tableCell) {
    result.tableCell = appendFontSizeClass(baseTheme.tableCell, config.tableCell)
  }

  if (config.tableCellHeader && baseTheme.tableCellHeader) {
    result.tableCellHeader = appendFontSizeClass(
      baseTheme.tableCellHeader,
      config.tableCellHeader
    )
  }

  if (config.text && baseTheme.text) {
    result.text = { ...baseTheme.text }
    const textKeys = [
      "bold",
      "italic",
      "code",
      "underline",
      "strikethrough",
      "underlineStrikethrough",
    ] as const
    for (const key of textKeys) {
      const value = config.text[key]
      if (value && result.text[key]) {
        result.text[key] = appendFontSizeClass(baseTheme.text[key] ?? "", value)
      }
    }
  }

  if (config.codeHighlight && baseTheme.codeHighlight) {
    const tokenClasses = baseTheme.codeHighlight as Record<string, string>
    const merged: Record<string, string> = {}
    for (const [token, cls] of Object.entries(tokenClasses)) {
      merged[token] = appendFontSizeClass(cls, config.codeHighlight)
    }
    result.codeHighlight = merged
  }

  return result
}

/** Tailwind text-size presets for document typography UI. */
export const FONT_SIZE_PRESETS: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
}
