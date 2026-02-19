"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import type { FontWeightTypographyConfig } from "@editor/ui/editor/themes/editor-theme";
import { FONT_WEIGHT_PRESETS } from "@editor/ui/lib/typography/font-weight";

const DEFAULT_VALUE = "__default__";

const PRESET_OPTIONS = [
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

function configToPresetKey(
  config: FontWeightTypographyConfig | undefined
): Record<SlotId, string> {
  const out = {} as Record<SlotId, string>;
  const heading = config?.heading;
  for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"] as const) {
    const cls = heading?.[tag];
    out[tag] = cls
      ? Object.keys(FONT_WEIGHT_PRESETS).find(
          (k) => FONT_WEIGHT_PRESETS[k] === cls
        ) ?? ""
      : "";
  }
  out.paragraph = config?.paragraph
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.paragraph
      ) ?? ""
    : "";
  out.quote = config?.quote
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.quote
      ) ?? ""
    : "";
  out.code = config?.code
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.code
      ) ?? ""
    : "";
  out.listitem = config?.listitem
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.listitem
      ) ?? ""
    : "";
  out.tableCell = config?.tableCell
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.tableCell
      ) ?? ""
    : "";
  out.tableCellHeader = config?.tableCellHeader
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.tableCellHeader
      ) ?? ""
    : "";
  out.codeHighlight = config?.codeHighlight
    ? Object.keys(FONT_WEIGHT_PRESETS).find(
        (k) => FONT_WEIGHT_PRESETS[k] === config.codeHighlight
      ) ?? ""
    : "";
  return out;
}

function presetKeyToClass(presetKey: string): string {
  if (!presetKey) return "";
  return FONT_WEIGHT_PRESETS[presetKey] ?? "";
}

function buildConfigFromPresetKeys(
  keys: Record<SlotId, string>
): FontWeightTypographyConfig | undefined {
  const heading: Partial<
    Record<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", string>
  > = {};
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

export interface FontWeightPanelProps {
  value: FontWeightTypographyConfig | undefined;
  onChange: (config: FontWeightTypographyConfig | undefined) => void;
  showTitle?: boolean;
}

export function FontWeightPanel({
  value,
  onChange,
  showTitle = true,
}: FontWeightPanelProps) {
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
        <h3 className="text-sm font-medium text-foreground">Font weight</h3>
      )}
      <div className="space-y-2">
        {SLOTS.map(({ id, label }) => (
          <div key={id} className="flex flex-col gap-1">
            <label
              htmlFor={`font-weight-${id}`}
              className="text-xs text-muted-foreground"
            >
              {label}
            </label>
            <Select
              value={selectValue(id)}
              onValueChange={(v) => handleSlotChange(id, v)}
            >
              <SelectTrigger
                id={`font-weight-${id}`}
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
