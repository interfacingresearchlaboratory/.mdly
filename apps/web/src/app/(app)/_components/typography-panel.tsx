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
} from "@editor/ui/editor/themes/editor-theme";
import { LETTER_SPACING_PRESETS } from "@editor/ui/lib/typography/letter-spacing";
import { FONT_WEIGHT_PRESETS } from "@editor/ui/lib/typography/font-weight";

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

export interface TypographyPanelProps {
  value: TypographyConfig | undefined;
  onChange: (config: TypographyConfig | undefined) => void;
}

export function TypographyPanel({ value, onChange }: TypographyPanelProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 pr-4 font-medium text-foreground">Type</th>
            <th className="pb-2 pr-2 font-medium text-foreground">
              Letter spacing
            </th>
            <th className="pb-2 font-medium text-foreground">Font weight</th>
          </tr>
        </thead>
        <tbody>
          {SLOTS.map(({ id, label }) => (
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
              <td className="py-1.5">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
