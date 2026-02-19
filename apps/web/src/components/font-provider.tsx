"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  APP_FONT_STORAGE_KEY,
  getAppFontCssValue,
} from "@/lib/app-fonts";

interface FontContextValue {
  /** Stored value: "geist" | "inter" or custom font-family string. */
  fontValue: string;
  setFontValue: (value: string) => void;
}

const FontContext = createContext<FontContextValue | null>(null);

function getStoredFontValue(): string {
  if (typeof window === "undefined") return "geist";
  const stored = localStorage.getItem(APP_FONT_STORAGE_KEY);
  if (stored) return stored;
  return "geist";
}

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontValue, setFontValueState] = useState<string>("geist");

  useEffect(() => {
    setFontValueState(getStoredFontValue());
  }, []);

  useEffect(() => {
    const cssValue = getAppFontCssValue(fontValue);
    document.body.style.setProperty("--font-app", cssValue);
  }, [fontValue]);

  const setFontValue = useCallback((value: string) => {
    setFontValueState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(APP_FONT_STORAGE_KEY, value);
    }
  }, []);

  const value = useMemo(
    () => ({ fontValue, setFontValue }),
    [fontValue, setFontValue]
  );

  return (
    <FontContext.Provider value={value}>{children}</FontContext.Provider>
  );
}

export function useAppFont() {
  const ctx = useContext(FontContext);
  if (!ctx) {
    throw new Error("useAppFont must be used within FontProvider");
  }
  return ctx;
}
