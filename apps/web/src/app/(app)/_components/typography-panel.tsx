"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import type {
  TypographyConfig,
  LetterSpacingTypographyConfig,
  FontWeightTypographyConfig,
  FontFamilyTypographyConfig,
  FontSizeTypographyConfig,
} from "@editor/ui/editor/themes/editor-theme";
import { LETTER_SPACING_PRESETS } from "@editor/ui/lib/typography/letter-spacing";
import { FONT_WEIGHT_PRESETS } from "@editor/ui/lib/typography/font-weight";
import { FONT_SIZE_PRESETS } from "@editor/ui/lib/typography/font-size";

const DEFAULT_VALUE = "__default__";

const LETTER_SPACING_OPTIONS = [
  { value: DEFAULT_VALUE, label: "Default" },
  { value: "tighter", label: "Tighter" },
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "wider", label: "Wider" },
  { value: "widest", label: "Widest" },
] as const;

const FONT_WEIGHT_OPTIONS = [
  { value: DEFAULT_VALUE, label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
] as const;

/** Document font options (fonts loaded in root layout). Use __default__ to clear. */
const DOCUMENT_FONT_OPTIONS = [
  { value: "__default__", label: "Default" },
  { value: "var(--font-geist-sans)", label: "Geist" },
  { value: "var(--font-inter)", label: "Inter" },
] as const;

/** Per-slot font options (Tailwind font-family classes). */
const FONT_SLOT_OPTIONS = [
  { value: "__default__", label: "Default" },
  { value: "font-[var(--font-geist-sans)]", label: "Geist" },
  { value: "font-[var(--font-inter)]", label: "Inter" },
] as const;

/** Document size options (CSS values for wrapper). Use __default__ to clear. */
const DOCUMENT_SIZE_OPTIONS = [
  { value: "__default__", label: "Default" },
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
] as const;

/** Per-slot size options (FONT_SIZE_PRESETS keys). */
const FONT_SIZE_SLOT_OPTIONS = [
  { value: "__default__", label: "Default" },
  { value: "xs", label: "XS" },
  { value: "sm", label: "Sm" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Lg" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
] as const;

type SlotId =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "paragraph"
  | "quote"
  | "code"
  | "listitem"
  | "tableCell"
  | "tableCellHeader"
  | "codeHighlight";

const SLOTS: { id: SlotId; label: string }[] = [
  { id: "h1", label: "Heading 1" },
  { id: "h2", label: "Heading 2" },
  { id: "h3", label: "Heading 3" },
  { id: "h4", label: "Heading 4" },
  { id: "h5", label: "Heading 5" },
  { id: "h6", label: "Heading 6" },
  { id: "paragraph", label: "Paragraph" },
  { id: "quote", label: "Quote" },
  { id: "code", label: "Code block" },
  { id: "listitem", label: "List item" },
  { id: "tableCell", label: "Table cell" },
  { id: "tableCellHeader", label: "Table header" },
  { id: "codeHighlight", label: "Code highlight" },
];

function letterSpacingPresetKeyForSlot(
  config: LetterSpacingTypographyConfig | undefined,
  slotId: SlotId
): string {
  if (!config) return "";
  if (slotId.startsWith("h") && config.heading) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const cls = config.heading[tag];
    return cls
      ? Object.keys(LETTER_SPACING_PRESETS).find(
          (k) => LETTER_SPACING_PRESETS[k] === cls
        ) ?? ""
      : "";
  }
  const key = slotId as keyof LetterSpacingTypographyConfig;
  const cls = config[key as keyof typeof config];
  if (typeof cls !== "string") return "";
  return Object.keys(LETTER_SPACING_PRESETS).find(
    (k) => LETTER_SPACING_PRESETS[k] === cls
  ) ?? "";
}

function fontWeightPresetKeyForSlot(
  config: FontWeightTypographyConfig | undefined,
  slotId: SlotId
): string {
  if (!config) return "";
  if (slotId.startsWith("h") && config.heading) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const cls = config.heading[tag];
    return cls
      ? Object.keys(FONT_WEIGHT_PRESETS).find(
          (k) => FONT_WEIGHT_PRESETS[k] === cls
        ) ?? ""
      : "";
  }
  const key = slotId as keyof FontWeightTypographyConfig;
  const cls = config[key as keyof typeof config];
  if (typeof cls !== "string") return "";
  return Object.keys(FONT_WEIGHT_PRESETS).find(
    (k) => FONT_WEIGHT_PRESETS[k] === cls
  ) ?? "";
}

function setLetterSpacingForSlot(
  config: TypographyConfig | undefined,
  slotId: SlotId,
  presetKey: string
): TypographyConfig {
  const letterSpacing = { ...config?.letterSpacing } as LetterSpacingTypographyConfig;
  const cls = presetKey ? LETTER_SPACING_PRESETS[presetKey] ?? "" : "";
  if (slotId.startsWith("h")) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    if (!letterSpacing.heading) letterSpacing.heading = {};
    if (cls) letterSpacing.heading[tag] = cls;
    else delete letterSpacing.heading[tag];
  } else {
    const key = slotId as keyof LetterSpacingTypographyConfig;
    if (cls) (letterSpacing as Record<string, string>)[key] = cls;
    else delete (letterSpacing as Record<string, unknown>)[key];
  }
  return { ...config, letterSpacing };
}

function setFontWeightForSlot(
  config: TypographyConfig | undefined,
  slotId: SlotId,
  presetKey: string
): TypographyConfig {
  const fontWeight = { ...config?.fontWeight } as FontWeightTypographyConfig;
  const cls = presetKey ? FONT_WEIGHT_PRESETS[presetKey] ?? "" : "";
  if (slotId.startsWith("h")) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    if (!fontWeight.heading) fontWeight.heading = {};
    if (cls) fontWeight.heading[tag] = cls;
    else delete fontWeight.heading[tag];
  } else {
    const key = slotId as keyof FontWeightTypographyConfig;
    if (cls) (fontWeight as Record<string, string>)[key] = cls;
    else delete (fontWeight as Record<string, unknown>)[key];
  }
  return { ...config, fontWeight };
}

function fontFamilyForSlot(
  config: FontFamilyTypographyConfig | undefined,
  slotId: SlotId
): string {
  if (!config) return "";
  if (slotId.startsWith("h") && config.heading) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return config.heading[tag] ?? "";
  }
  const key = slotId as keyof FontFamilyTypographyConfig;
  const v = config[key as keyof typeof config];
  return typeof v === "string" ? v : "";
}

function fontSizePresetKeyForSlot(
  config: FontSizeTypographyConfig | undefined,
  slotId: SlotId
): string {
  if (!config) return "";
  if (slotId.startsWith("h") && config.heading) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const cls = config.heading[tag];
    return cls
      ? Object.keys(FONT_SIZE_PRESETS).find(
          (k) => FONT_SIZE_PRESETS[k] === cls
        ) ?? ""
      : "";
  }
  const key = slotId as keyof FontSizeTypographyConfig;
  const cls = config[key as keyof typeof config];
  if (typeof cls !== "string") return "";
  return Object.keys(FONT_SIZE_PRESETS).find(
    (k) => FONT_SIZE_PRESETS[k] === cls
  ) ?? "";
}

function setFontFamilyForSlot(
  config: TypographyConfig | undefined,
  slotId: SlotId,
  classValue: string
): TypographyConfig {
  const fontFamilySlots = {
    ...config?.fontFamilySlots,
  } as FontFamilyTypographyConfig;
  if (slotId.startsWith("h")) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    if (!fontFamilySlots.heading) fontFamilySlots.heading = {};
    if (classValue) fontFamilySlots.heading[tag] = classValue;
    else delete fontFamilySlots.heading[tag];
  } else {
    const key = slotId as keyof FontFamilyTypographyConfig;
    if (classValue) (fontFamilySlots as Record<string, string>)[key] = classValue;
    else delete (fontFamilySlots as Record<string, unknown>)[key];
  }
  return { ...config, fontFamilySlots };
}

function setFontSizeForSlot(
  config: TypographyConfig | undefined,
  slotId: SlotId,
  presetKey: string
): TypographyConfig {
  const fontSizeSlots = { ...config?.fontSizeSlots } as FontSizeTypographyConfig;
  const cls = presetKey ? FONT_SIZE_PRESETS[presetKey] ?? "" : "";
  if (slotId.startsWith("h")) {
    const tag = slotId as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    if (!fontSizeSlots.heading) fontSizeSlots.heading = {};
    if (cls) fontSizeSlots.heading[tag] = cls;
    else delete fontSizeSlots.heading[tag];
  } else {
    const key = slotId as keyof FontSizeTypographyConfig;
    if (cls) (fontSizeSlots as Record<string, string>)[key] = cls;
    else delete (fontSizeSlots as Record<string, unknown>)[key];
  }
  return { ...config, fontSizeSlots };
}

function setDocumentFont(
  config: TypographyConfig | undefined,
  fontFamilyValue: string
): TypographyConfig {
  const next = { ...config };
  if (fontFamilyValue) {
    next.fontFamily = fontFamilyValue;
  } else {
    delete next.fontFamily;
  }
  return next;
}

function setDocumentSize(
  config: TypographyConfig | undefined,
  fontSizeValue: string
): TypographyConfig {
  const next = { ...config };
  if (fontSizeValue) {
    next.fontSize = fontSizeValue;
  } else {
    delete next.fontSize;
  }
  return next;
}

export interface TypographyPanelProps {
  value: TypographyConfig | undefined;
  onChange: (config: TypographyConfig | undefined) => void;
}

export function TypographyPanel({ value, onChange }: TypographyPanelProps) {
  const documentFontValue =
    value?.fontFamily &&
    DOCUMENT_FONT_OPTIONS.some((o) => o.value === value.fontFamily)
      ? value.fontFamily
      : "__default__";

  const documentSizeValue =
    value?.fontSize &&
    DOCUMENT_SIZE_OPTIONS.some((o) => o.value === value.fontSize)
      ? value.fontSize
      : "__default__";

  return (
    <div className="w-full overflow-x-auto space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="typography-document-font"
            className="text-sm font-medium text-foreground shrink-0"
          >
            Apply to all — Font
          </label>
          <Select
            value={documentFontValue}
            onValueChange={(v) =>
              onChange(setDocumentFont(value, v === "__default__" ? "" : v))
            }
          >
            <SelectTrigger
              id="typography-document-font"
              className="h-8 text-xs w-28"
            >
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_FONT_OPTIONS.map(({ value: v, label: l }) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="typography-document-size"
            className="text-sm font-medium text-foreground shrink-0"
          >
            Size
          </label>
          <Select
            value={documentSizeValue}
            onValueChange={(v) =>
              onChange(setDocumentSize(value, v === "__default__" ? "" : v))
            }
          >
            <SelectTrigger
              id="typography-document-size"
              className="h-8 text-xs w-28"
            >
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_SIZE_OPTIONS.map(({ value: v, label: l }) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 pr-4 font-medium text-foreground">Type</th>
            <th className="pb-2 pr-2 font-medium text-foreground">
              Letter spacing
            </th>
            <th className="pb-2 pr-2 font-medium text-foreground">
              Font weight
            </th>
            <th className="pb-2 pr-2 font-medium text-foreground">Font</th>
            <th className="pb-2 font-medium text-foreground">Size</th>
          </tr>
        </thead>
        <tbody>
          {SLOTS.map(({ id, label }) => {
            const slotFontValue = fontFamilyForSlot(value?.fontFamilySlots, id);
            const fontSelectValue =
              FONT_SLOT_OPTIONS.some((o) => o.value === slotFontValue)
                ? slotFontValue
                : "__default__";
            return (
              <tr key={id} className="border-b border-border/50">
                <td className="py-1.5 pr-4 text-muted-foreground">{label}</td>
                <td className="py-1.5 pr-2">
                  <Select
                    value={
                      letterSpacingPresetKeyForSlot(value?.letterSpacing, id) ||
                      DEFAULT_VALUE
                    }
                    onValueChange={(v) => {
                      const presetKey = v === DEFAULT_VALUE ? "" : v;
                      onChange(setLetterSpacingForSlot(value, id, presetKey));
                    }}
                  >
                    <SelectTrigger
                      id={`typography-ls-${id}`}
                      className="h-8 text-xs"
                    >
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      {LETTER_SPACING_OPTIONS.map(({ value: v, label: l }) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-1.5 pr-2">
                  <Select
                    value={
                      fontWeightPresetKeyForSlot(value?.fontWeight, id) ||
                      DEFAULT_VALUE
                    }
                    onValueChange={(v) => {
                      const presetKey = v === DEFAULT_VALUE ? "" : v;
                      onChange(setFontWeightForSlot(value, id, presetKey));
                    }}
                  >
                    <SelectTrigger
                      id={`typography-fw-${id}`}
                      className="h-8 text-xs"
                    >
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_WEIGHT_OPTIONS.map(({ value: v, label: l }) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-1.5 pr-2">
                  <Select
                    value={fontSelectValue}
                    onValueChange={(v) =>
                      onChange(
                        setFontFamilyForSlot(
                          value,
                          id,
                          v === "__default__" ? "" : v
                        )
                      )
                    }
                  >
                    <SelectTrigger
                      id={`typography-ff-${id}`}
                      className="h-8 text-xs"
                    >
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SLOT_OPTIONS.map(({ value: v, label: l }) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-1.5">
                  <Select
                    value={
                      fontSizePresetKeyForSlot(value?.fontSizeSlots, id) ||
                      DEFAULT_VALUE
                    }
                    onValueChange={(v) => {
                      const presetKey = v === DEFAULT_VALUE ? "" : v;
                      onChange(setFontSizeForSlot(value, id, presetKey));
                    }}
                  >
                    <SelectTrigger
                      id={`typography-fs-${id}`}
                      className="h-8 text-xs"
                    >
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SIZE_SLOT_OPTIONS.map(({ value: v, label: l }) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
