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
  APP_FONT_KEYS,
  APP_FONT_STORAGE_KEY,
  APP_FONT_VARIABLES,
  type AppFontKey,
} from "@/lib/app-fonts";

interface FontContextValue {
  fontKey: AppFontKey;
  setFontKey: (key: AppFontKey) => void;
}

const FontContext = createContext<FontContextValue | null>(null);

function getStoredFontKey(): AppFontKey {
  if (typeof window === "undefined") return "geist";
  const stored = localStorage.getItem(APP_FONT_STORAGE_KEY);
  if (stored && APP_FONT_KEYS.includes(stored as AppFontKey)) {
    return stored as AppFontKey;
  }
  return "geist";
}

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontKey, setFontKeyState] = useState<AppFontKey>("geist");

  useEffect(() => {
    setFontKeyState(getStoredFontKey());
  }, []);

  useEffect(() => {
    const value = APP_FONT_VARIABLES[fontKey];
    document.body.style.setProperty("--font-app", value);
  }, [fontKey]);

  const setFontKey = useCallback((key: AppFontKey) => {
    setFontKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(APP_FONT_STORAGE_KEY, key);
    }
  }, []);

  const value = useMemo(
    () => ({ fontKey, setFontKey }),
    [fontKey, setFontKey]
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
