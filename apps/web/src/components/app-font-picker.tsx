"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import { useAppFont } from "./font-provider";
import { useCustomFonts } from "./custom-fonts-provider";
import { APP_FONT_KEYS, APP_FONT_LABELS } from "@/lib/app-fonts";

export function AppFontPicker() {
  const { fontValue, setFontValue } = useAppFont();
  const { customFonts } = useCustomFonts();

  return (
    <Select
      value={fontValue}
      onValueChange={setFontValue}
      aria-label="App font"
    >
      <SelectTrigger className="h-8 w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APP_FONT_KEYS.map((key) => (
          <SelectItem key={key} value={key}>
            {APP_FONT_LABELS[key]}
          </SelectItem>
        ))}
        {customFonts.map((f) => (
          <SelectItem key={f.id} value={f.fontFamily}>
            {f.fontFamily}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
