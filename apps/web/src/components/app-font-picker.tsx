"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editor/ui/select";
import { useAppFont } from "./font-provider";
import { APP_FONT_KEYS, APP_FONT_LABELS, type AppFontKey } from "@/lib/app-fonts";

export function AppFontPicker() {
  const { fontKey, setFontKey } = useAppFont();

  return (
    <Select
      value={fontKey}
      onValueChange={(v) => setFontKey(v as AppFontKey)}
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
      </SelectContent>
    </Select>
  );
}
