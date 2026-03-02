"use client";

import { $isCodeNode, CodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { type JSX, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, CopyIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";

const CODE_LANGUAGES = [
  { value: "plain", label: "Plain" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
] as const;

const TOOLBAR_WIDTH = 172;
const TOP_RIGHT_PADDING = 12;

function CodeBlockToolbar({
  position,
  language,
  onLanguageChange,
  onCopy,
}: {
  position: { top: number; left: number } | null;
  language: string | null | undefined;
  onLanguageChange: (language: string) => void;
  onCopy: () => void;
}) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy();
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }, [onCopy]);

  if (position === null) return null;

  return (
    <div
      className="absolute z-10 flex items-center gap-1"
      style={{
        left: position.left,
        top: position.top,
        width: TOOLBAR_WIDTH,
      }}
    >
      <Select
        value={language ?? "plain"}
        onValueChange={onLanguageChange}
      >
        <SelectTrigger
          className="h-7 flex-1 border-0 bg-transparent text-xs text-muted-foreground shadow-none hover:bg-muted/50 focus:ring-0"
        >
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" align="end">
          {CODE_LANGUAGES.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        aria-label="Copy code"
      >
        {hasCopied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
      </button>
    </div>
  );
}

function CodeBlockLanguagePluginInner({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}) {
  const [editor] = useLexicalComposerContext();
  const [activeCodeNode, setActiveCodeNode] = useState<{
    key: string;
    language: string | null | undefined;
  } | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!activeCodeNode) {
      setDropdownPosition(null);
      return;
    }
    const el = editor.getElementByKey(activeCodeNode.key);
    if (!el) {
      setDropdownPosition(null);
      return;
    }
    const codeRect = el.getBoundingClientRect();
    const anchorRect = anchorElem.getBoundingClientRect();
    setDropdownPosition({
      left:
        codeRect.right -
        anchorRect.left -
        TOOLBAR_WIDTH -
        TOP_RIGHT_PADDING,
      top: codeRect.top - anchorRect.top + TOP_RIGHT_PADDING,
    });
  }, [activeCodeNode, anchorElem, editor]);

  const updateActiveCodeNode = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        setActiveCodeNode(null);
        return;
      }
      const anchorNode = selection.anchor.getNode();
      const codeNode = $findMatchingParent(anchorNode, $isCodeNode) as
        | CodeNode
        | null;
      if (codeNode === null) {
        setActiveCodeNode(null);
        return;
      }
      setActiveCodeNode({
        key: codeNode.getKey(),
        language: codeNode.getLanguage(),
      });
    });
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updateActiveCodeNode();
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateActiveCodeNode();
          return false;
        },
        0
      )
    );
  }, [editor, updateActiveCodeNode]);

  const handleLanguageChange = useCallback(
    (language: string) => {
      if (!activeCodeNode) return;
      const nextLanguage =
        language === "plain" ? undefined : language;
      editor.update(() => {
        const node = $getNodeByKey(activeCodeNode.key);
        if (node && $isCodeNode(node)) {
          node.getWritable().setLanguage(nextLanguage);
        }
      });
      setActiveCodeNode((prev) =>
        prev ? { ...prev, language: nextLanguage } : null
      );
    },
    [activeCodeNode, editor]
  );

  const handleCopy = useCallback(() => {
    if (!activeCodeNode) return;
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(activeCodeNode.key);
      if (node && $isCodeNode(node)) {
        const text = node.getTextContent();
        navigator.clipboard.writeText(text);
      }
    });
  }, [activeCodeNode, editor]);

  if (!activeCodeNode) return null;

  return (
    <CodeBlockToolbar
      position={dropdownPosition}
      language={activeCodeNode.language}
      onLanguageChange={handleLanguageChange}
      onCopy={handleCopy}
    />
  );
}

export function CodeBlockLanguagePlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): JSX.Element | null {
  return createPortal(
    <CodeBlockLanguagePluginInner anchorElem={anchorElem} />,
    anchorElem
  );
}
