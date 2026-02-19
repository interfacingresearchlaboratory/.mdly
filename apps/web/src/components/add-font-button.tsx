"use client";

import { useRef } from "react";
import { Button } from "@editor/ui/button";
import { useCustomFonts } from "./custom-fonts-provider";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const ACCEPT = ".ttf,.otf,.woff,.woff2";

export function AddFontButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addFont } = useCustomFonts();

  function handleClick() {
    inputRef.current?.click();
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleClick}
        aria-label="Add font from file"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </>
  );
}
