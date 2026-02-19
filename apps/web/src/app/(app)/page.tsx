"use client";

import { useState } from "react";
import { TableOfContents } from "@editor/ui/table-of-contents";
import { ToolbarlessEditor } from "@editor/ui/editor/toolbarless-editor";
import { ThemeToggle } from "../../components/theme-toggle";
import { AppFontPicker } from "../../components/app-font-picker";
import { ShortcutsDirectory } from "./_components/shortcuts-directory";
import { TypographyPanel } from "./_components/typography-panel";
import { Button } from "@editor/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@editor/ui/dialog";
import { Github, Type } from "lucide-react";
import type { TypographyConfig } from "@editor/ui/editor/themes/editor-theme";

type EditorContent = Parameters<
  NonNullable<React.ComponentProps<typeof ToolbarlessEditor>["onChange"]>
>[0];

const seedContent = {
  root: {
    children: [
      // H1 — Welcome
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Welcome to the Editor",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        tag: "h1",
        type: "heading",
        version: 1,
      },
      // Intro paragraph
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "This is a ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 1,
            mode: "normal",
            style: "",
            text: "Lexical",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "-based rich text editor built with ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 1,
            mode: "normal",
            style: "",
            text: "shadcn/ui",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", in a Turborepo monorepo. The document you're reading showcases everything the editor can do — from headings and lists to code blocks and tables.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      // H2 — Features
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "What you can do",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        tag: "h2",
        type: "heading",
        version: 1,
      },
      // Inline formatting demo
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Select text to format it: ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 1,
            mode: "normal",
            style: "",
            text: "bold",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 2,
            mode: "normal",
            style: "",
            text: "italic",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 4,
            mode: "normal",
            style: "",
            text: "underline",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ", and inline ",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 16,
            mode: "normal",
            style: "",
            text: "code",
            type: "text",
            version: 1,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: ". Use the floating toolbar or keyboard shortcuts.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      // Placeholder text example
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Add your thoughts here…",
            type: "placeholder-text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      // Bullet list (with indented sub-list under "Parent topic")
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Headings (H1–H3), paragraphs, and block types",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Bulleted, numbered, and check lists",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: null,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Code blocks with syntax highlighting",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: null,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Tables, quotes, and horizontal rules",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: null,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Parent topic",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: null,
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Sub-point A",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 1,
                    type: "listitem",
                    version: 1,
                    value: 1,
                  },
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Sub-point B",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 1,
                    type: "listitem",
                    version: 1,
                    value: 2,
                  },
              
                ],
                direction: null,
                format: "",
                indent: 0,
                type: "list",
                version: 1,
                listType: "bullet",
                start: 1,
                tag: "ul",
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: null,
          },
        ],
        direction: "ltr",
        format: "",
        type: "list",
        version: 1,
        listType: "bullet",
        tag: "ul",
      },
      // Numbered list — Quick start
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Type / to open slash commands (headings, lists, table, quote)",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            indent: 0,
            type: "listitem",
            value: 1,
            version: 1,
          },
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Select text for the floating format toolbar",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            indent: 0,
            type: "listitem",
            value: 2,
            version: 1,
          },
          {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: "Use the table of contents in the sidebar to jump between sections",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
              },
            ],
            direction: "ltr",
            indent: 0,
            type: "listitem",
            value: 3,
            version: 1,
          },
        ],
        direction: "ltr",
        listType: "number",
        type: "list",
        version: 1,
      },
      // Quote
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Everything you see here is editable. This block is a quote — try changing it or adding more content below.",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "quote",
        version: 1,
      },
      // Code block
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "// Code blocks support a language for highlighting\nconst greeting = \"Hello, Editor!\";\nconsole.log(greeting);\n",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        language: "typescript",
        type: "code",
        version: 1,
      },
      // Horizontal rule
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "horizontalrule",
        version: 1,
      },
      // H2 — Example table
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Example table",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        tag: "h2",
        type: "heading",
        version: 1,
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Feature",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                  },
                ],
                colSpan: 1,
                headerState: 1,
                rowSpan: 1,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "tablecell",
                version: 1,
              },
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Included",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                  },
                ],
                colSpan: 1,
                headerState: 1,
                rowSpan: 1,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "tablecell",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "tablerow",
            version: 1,
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Markdown shortcuts",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                  },
                ],
                colSpan: 1,
                headerState: 0,
                rowSpan: 1,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "tablecell",
                version: 1,
              },
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Yes",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                  },
                ],
                colSpan: 1,
                headerState: 0,
                rowSpan: 1,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "tablecell",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "tablerow",
            version: 1,
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Links & images",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                  },
                ],
                colSpan: 1,
                headerState: 0,
                rowSpan: 1,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "tablecell",
                version: 1,
              },
              {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Yes",
                        type: "text",
                        version: 1,
                      },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                  },
                ],
                colSpan: 1,
                headerState: 0,
                rowSpan: 1,
                direction: "ltr",
                format: "",
                indent: 0,
                type: "tablecell",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "tablerow",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "table",
        version: 1,
      },
      // Closing paragraph
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "This editor runs in the main app (apps/web). The ",
            type: "text",
            version: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "GitHub repo",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "link",
            version: 1,
            url: "https://github.com/interfacingresearchlaboratory/editor",
            rel: null,
            title: null,
          },
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: " has the full source. Explore the repo, try the slash menu and formatting tools, and build something with it.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as const;

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

  return (
    <div className="flex gap-8 w-full relative" suppressHydrationWarning>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <AppFontPicker />
        <ThemeToggle />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Letter spacing"
            >
              <Type className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Typography</DialogTitle>
            </DialogHeader>
            <TypographyPanel value={typography} onChange={setTypography} />
          </DialogContent>
        </Dialog>
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
            />
          </div>
        </div>
      </div>
      <aside className="hidden md:block w-52 shrink-0" aria-hidden="true" />
      <ShortcutsDirectory />
    </div>
  );
}
