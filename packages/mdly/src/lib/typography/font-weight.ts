import type { EditorThemeClasses } from "lexical"

/**
 * Font weight config keys that map to Lexical theme paths.
 * Values are Tailwind font-weight classes (e.g. "font-medium", "font-bold").
 */
export interface FontWeightTypographyConfig {
  /** Block-level: headings h1–h6 */
  heading?: Partial<Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", string>>
  /** Block-level: paragraph */
  paragraph?: string
  /** Block-level: blockquote */
  quote?: string
  /** Block-level: code block */
  code?: string
  /** Block-level: list items */
  listitem?: string
  /** Block-level: table cell */
  tableCell?: string
  /** Block-level: table header cell */
  tableCellHeader?: string
  /** Inline text formats */
  text?: Partial<
    Record<
      "bold" | "italic" | "code" | "underline" | "strikethrough" | "underlineStrikethrough",
      string
    >
  >
  /** Code highlight tokens (one value for all) */
  codeHighlight?: string
}

/** Removes any Tailwind font-* class from a class string. */
function stripFontWeightClass(className: string): string {
  return className.replace(/\bfont-\S+/g, "").replace(/\s+/g, " ").trim()
}

function appendFontWeightClass(base: string, fontClass: string): string {
  if (!fontClass.trim()) return base
  const without = stripFontWeightClass(base)
  return without ? `${without} ${fontClass}` : fontClass
}

/**
 * Merges font-weight overrides into a Lexical theme.
 * For each key present in config, replaces any existing font-* class with the configured one.
 */
export function mergeFontWeightIntoTheme(
  baseTheme: EditorThemeClasses,
  config: FontWeightTypographyConfig
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
        result.heading[tag] = appendFontWeightClass(
          baseTheme.heading[tag] ?? "",
          value
        )
      }
    }
  }

  if (config.paragraph && baseTheme.paragraph) {
    result.paragraph = appendFontWeightClass(baseTheme.paragraph, config.paragraph)
  }

  if (config.quote && baseTheme.quote) {
    result.quote = appendFontWeightClass(baseTheme.quote, config.quote)
  }

  if (config.code && baseTheme.code) {
    result.code = appendFontWeightClass(baseTheme.code, config.code)
  }

  if (config.listitem && baseTheme.list?.listitem) {
    result.list = { ...baseTheme.list }
    result.list.listitem = appendFontWeightClass(
      baseTheme.list.listitem,
      config.listitem
    )
  }

  if (config.tableCell && baseTheme.tableCell) {
    result.tableCell = appendFontWeightClass(baseTheme.tableCell, config.tableCell)
  }

  if (config.tableCellHeader && baseTheme.tableCellHeader) {
    result.tableCellHeader = appendFontWeightClass(
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
        result.text[key] = appendFontWeightClass(baseTheme.text[key] ?? "", value)
      }
    }
  }

  if (config.codeHighlight && baseTheme.codeHighlight) {
    const tokenClasses = baseTheme.codeHighlight as Record<string, string>
    const merged: Record<string, string> = {}
    for (const [token, cls] of Object.entries(tokenClasses)) {
      merged[token] = appendFontWeightClass(cls, config.codeHighlight!)
    }
    result.codeHighlight = merged
  }

  return result
}

/** Tailwind font-weight preset names to classes. Used for document typography UI. */
export const FONT_WEIGHT_PRESETS: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
}

/** Presets for inline (selection) font weight. CSS values for $patchStyleText. */
export const FONT_WEIGHT_INLINE_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "Default" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
]
