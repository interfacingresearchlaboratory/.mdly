"use client";

import { useRef } from "react";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ADD_FONT_VALUE = "__add_font__";
const ACCEPT = ".ttf,.otf,.woff,.woff2";

export function AppFontPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fontValue, setFontValue } = useAppFont();
  const { customFonts, addFont } = useCustomFonts();

  function handleValueChange(value: string) {
    if (value === ADD_FONT_VALUE) {
      inputRef.current?.click();
      return;
    }
    setFontValue(value);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      try {
        await addFont(file);
        toast.success(`Added font: ${file.name}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add font");
      }
    }
    e.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        aria-hidden
        onChange={handleFileChange}
      />
      <Select
        value={fontValue}
        onValueChange={handleValueChange}
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
          <SelectItem value={ADD_FONT_VALUE} className="text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add font…
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
