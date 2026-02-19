import type { EditorThemeClasses } from "lexical"

/**
 * Per-slot font family config (same shape as letter spacing).
 * Values are Tailwind font-family classes (e.g. "font-[var(--font-inter)]").
 */
export interface FontFamilyTypographyConfig {
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

/**
 * Merges per-slot font-family overrides into a Lexical theme.
 */
export function mergeFontFamilyIntoTheme(
  baseTheme: EditorThemeClasses,
  config: FontFamilyTypographyConfig
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
        result.heading[tag] = appendClass(
          baseTheme.heading[tag] ?? "",
          value
        )
      }
    }
  }

  if (config.paragraph && baseTheme.paragraph) {
    result.paragraph = appendClass(baseTheme.paragraph, config.paragraph)
  }

  if (config.quote && baseTheme.quote) {
    result.quote = appendClass(baseTheme.quote, config.quote)
  }

  if (config.code && baseTheme.code) {
    result.code = appendClass(baseTheme.code, config.code)
  }

  if (config.listitem && baseTheme.list?.listitem) {
    result.list = { ...baseTheme.list }
    result.list.listitem = appendClass(
      baseTheme.list.listitem,
      config.listitem
    )
  }

  if (config.tableCell && baseTheme.tableCell) {
    result.tableCell = appendClass(baseTheme.tableCell, config.tableCell)
  }

  if (config.tableCellHeader && baseTheme.tableCellHeader) {
    result.tableCellHeader = appendClass(
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
        result.text[key] = appendClass(baseTheme.text[key] ?? "", value)
      }
    }
  }

  if (config.codeHighlight && baseTheme.codeHighlight) {
    const tokenClasses = baseTheme.codeHighlight as Record<string, string>
    const merged: Record<string, string> = {}
    for (const [token, cls] of Object.entries(tokenClasses)) {
      merged[token] = appendClass(cls, config.codeHighlight)
    }
    result.codeHighlight = merged
  }

  return result
}
