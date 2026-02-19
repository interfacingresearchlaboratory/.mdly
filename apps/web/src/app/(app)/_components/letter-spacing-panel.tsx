"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import type { LetterSpacingTypographyConfig } from "@editor/ui/editor/themes/editor-theme";
import { LETTER_SPACING_PRESETS } from "@editor/ui/lib/typography/letter-spacing";
import { type SlotId, TYPOGRAPHY_SLOTS } from "./typography-slots";

const DEFAULT_VALUE = "__default__";

const PRESET_OPTIONS = [
  { value: DEFAULT_VALUE, label: "Default" },
  { value: "tighter", label: "Tighter" },
  { value: "tight", label: "Tight" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "wider", label: "Wider" },
  { value: "widest", label: "Widest" },
] as const;

function configToPresetKey(config: LetterSpacingTypographyConfig | undefined): Record<SlotId, string> {
  const out = {} as Record<SlotId, string>;
  const heading = config?.heading;
  for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
    const cls = heading?.[tag];
    out[tag] = cls ? (LETTER_SPACING_PRESETS[cls] ? Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === cls) ?? "" : "") : "";
  }
  out.paragraph = config?.paragraph ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.paragraph) ?? "") : "";
  out.quote = config?.quote ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.quote) ?? "") : "";
  out.code = config?.code ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.code) ?? "") : "";
  out.listitem = config?.listitem ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.listitem) ?? "") : "";
  out.tableCell = config?.tableCell ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.tableCell) ?? "") : "";
  out.tableCellHeader = config?.tableCellHeader ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.tableCellHeader) ?? "") : "";
  out.codeHighlight = config?.codeHighlight ? (Object.keys(LETTER_SPACING_PRESETS).find((k) => LETTER_SPACING_PRESETS[k] === config.codeHighlight) ?? "") : "";
  return out;
}

function presetKeyToClass(presetKey: string): string {
  if (!presetKey) return "";
  return LETTER_SPACING_PRESETS[presetKey] ?? "";
}

function buildConfigFromPresetKeys(keys: Record<SlotId, string>): LetterSpacingTypographyConfig | undefined {
  const heading: Partial<Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", string>> = {};
  for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
    const cls = presetKeyToClass(keys[tag]);
    if (cls) heading[tag] = cls;
  }
  const paragraph = presetKeyToClass(keys.paragraph) || undefined;
  const quote = presetKeyToClass(keys.quote) || undefined;
  const code = presetKeyToClass(keys.code) || undefined;
  const listitem = presetKeyToClass(keys.listitem) || undefined;
  const tableCell = presetKeyToClass(keys.tableCell) || undefined;
  const tableCellHeader = presetKeyToClass(keys.tableCellHeader) || undefined;
  const codeHighlight = presetKeyToClass(keys.codeHighlight) || undefined;

  if (
    Object.keys(heading).length === 0 &&
    !paragraph &&
    !quote &&
    !code &&
    !listitem &&
    !tableCell &&
    !tableCellHeader &&
    !codeHighlight
  ) {
    return undefined;
  }
  return {
    ...(Object.keys(heading).length > 0 ? { heading } : {}),
    ...(paragraph ? { paragraph } : {}),
    ...(quote ? { quote } : {}),
    ...(code ? { code } : {}),
    ...(listitem ? { listitem } : {}),
    ...(tableCell ? { tableCell } : {}),
    ...(tableCellHeader ? { tableCellHeader } : {}),
    ...(codeHighlight ? { codeHighlight } : {}),
  };
}

export interface LetterSpacingPanelProps {
  value: LetterSpacingTypographyConfig | undefined;
  onChange: (config: LetterSpacingTypographyConfig | undefined) => void;
  /** Show "Letter spacing" heading (e.g. false when used inside a dialog with its own title). */
  showTitle?: boolean;
}

export function LetterSpacingPanel({
  value,
  onChange,
  showTitle = true,
}: LetterSpacingPanelProps) {
  const presetKeys = configToPresetKey(value);

  const handleSlotChange = (slotId: SlotId, value: string) => {
    const presetKey = value === DEFAULT_VALUE ? "" : value;
    const next = { ...presetKeys, [slotId]: presetKey };
    onChange(buildConfigFromPresetKeys(next));
  };

  const selectValue = (slotId: SlotId) => {
    const v = presetKeys[slotId] || "";
    return v || DEFAULT_VALUE;
  };

  return (
    <div className={showTitle ? "space-y-3 pt-6" : "space-y-3"}>
      {showTitle && (
        <h3 className="text-sm font-medium text-foreground">Letter spacing</h3>
      )}
      <div className="space-y-2">
        {TYPOGRAPHY_SLOTS.map(({ id, label }) => (
          <div key={id} className="flex flex-col gap-1">
            <label htmlFor={`letter-spacing-${id}`} className="text-xs text-muted-foreground">
              {label}
            </label>
            <Select
              value={selectValue(id)}
              onValueChange={(v) => handleSlotChange(id, v)}
            >
              <SelectTrigger
                id={`letter-spacing-${id}`}
                className="h-8 text-xs"
              >
                <SelectValue placeholder="Default" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_OPTIONS.map(({ value: v, label: l }) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
