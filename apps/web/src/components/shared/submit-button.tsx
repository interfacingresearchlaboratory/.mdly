"use client";

import { useEffect } from "react";
import { Button } from "@editor/ui/button";
import { Kbd, KbdGroup } from "@editor/ui/kbd";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  children: ReactNode;
  onClick: () => void;
  isSubmitting?: boolean;
  loadingText?: string;
  enabled?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function SubmitButton({
  children,
  onClick,
  isSubmitting = false,
  loadingText = "Saving...",
  enabled = true,
  type = "button",
  disabled = false,
  variant = "default",
}: SubmitButtonProps) {
  // Handle Command+Enter (Mac) or Ctrl+Enter (Windows/Linux)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting && !disabled) {
          onClick();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, isSubmitting, disabled, onClick]);

  return (
    <Button
      type={type}
      variant={variant}
      onClick={onClick}
      disabled={disabled || isSubmitting}
    >
      <span className="flex items-center gap-2">
        {isSubmitting ? loadingText : children}
        {!isSubmitting && (
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
        )}
      </span>
    </Button>
  );
}
