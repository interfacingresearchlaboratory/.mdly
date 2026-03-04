"use client";

import { useMemo, useState } from "react";
import { TableOfContents } from "@editor/ui/table-of-contents";
import { ToolbarlessEditor, type ImageUploadConfig } from "mdly/editor";
import { ThemeToggle } from "../../components/theme-toggle";
import { AppFontPicker } from "../../components/app-font-picker";
import { ShortcutsDirectory } from "./_components/shortcuts-directory";
import { TypographyDialog } from "./_components/typography-dialog";
import { Button } from "@editor/ui/button";
import { Coffee, Github } from "lucide-react";
import type { TypographyConfig } from "mdly/editor";
import { seedContent } from "@/seed/editor-seed";
import { toast } from "sonner";

type EditorContent = Parameters<
  NonNullable<React.ComponentProps<typeof ToolbarlessEditor>["onChange"]>
>[0];



export default function Home() {
  const [typography, setTypography] = useState<TypographyConfig | undefined>(
    undefined
  );
  const [lastEditorState, setLastEditorState] = useState<
    EditorContent | undefined
  >(undefined);

  const editorResetKey =
    typography && Object.keys(typography).length > 0
      ? JSON.stringify(typography)
      : "toolbarless-editor";

  const imageUploadConfig = useMemo<ImageUploadConfig | null>(() => {
    return {
      upload: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        let res: Response;
        try {
          res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Network error";
          throw new Error(
            msg.includes("fetch") || msg.includes("Network")
              ? "Network error. Check the dev server is running and try again."
              : msg
          );
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? res.statusText ?? "Upload failed");
        }
        const { url } = await res.json();
        return url;
      },
      onUploadError: (err) => toast.error(err.message),
    };
  }, []);

  return (
    <div className="flex gap-8 w-full relative" suppressHydrationWarning>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <AppFontPicker />
        <TypographyDialog value={typography} onChange={setTypography} />
        <ThemeToggle />
       
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a
            href="https://github.com/interfacingresearchlaboratory/editor"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a
            href="https://buymeacoffee.com/irldevs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy Me a Coffee"
          >
            <Coffee className="h-4 w-4" />
          </a>
        </Button>
      </div>
      <aside className="hidden md:block w-52 shrink-0">
        <div className="sticky top-20">
          <TableOfContents contentSelector="[data-toc-content]" />
        </div>
      </aside>
      <div className="min-w-0 flex-1 flex justify-center pt-12 pb-20">
        <div className="w-full max-w-2xl px-4 py-6 space-y-8">
          <div data-toc-content>
            <ToolbarlessEditor
              resetKey={editorResetKey}
              initialContent={lastEditorState ?? seedContent}
              placeholder="Start writing…"
              typography={typography}
              onChange={setLastEditorState}
              imageUploadConfig={imageUploadConfig}
            />
          </div>
        </div>
      </div>
      <aside className="hidden md:block w-52 shrink-0" aria-hidden="true" />
      <ShortcutsDirectory />
    </div>
  );
}
