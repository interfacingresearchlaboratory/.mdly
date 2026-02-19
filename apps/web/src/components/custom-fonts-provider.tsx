"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type CustomFont,
  fontFamilyNameFromFile,
  generateCustomFontId,
  getFontFormatFromFile,
} from "@/lib/custom-fonts";

interface CustomFontsContextValue {
  customFonts: CustomFont[];
  addFont: (file: File) => Promise<void>;
  removeFont: (id: string) => void;
}

const CustomFontsContext = createContext<CustomFontsContextValue | null>(null);

function registerFont(
  file: File
): Promise<Omit<CustomFont, "fontFamily"> & { fontFamily: string }> {
  const id = generateCustomFontId();
  const fontFamily = fontFamilyNameFromFile(file);
  const url = URL.createObjectURL(file);
  const format = getFontFormatFromFile(file);
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.href = url;
    link.crossOrigin = "anonymous";
    link.onload = () => {
      document.head.removeChild(link);
      resolve({ id, fontFamily, url, format });
    };
    link.onerror = () => {
      document.head.removeChild(link);
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load font: ${file.name}`));
    };
    document.head.appendChild(link);
  });
}

function buildCustomFontsStyle(fonts: CustomFont[]): string {
  const rules: string[] = [];
  for (const f of fonts) {
    const escaped = f.fontFamily.replace(/"/g, '\\"');
    rules.push(
      `@font-face { font-family: "${escaped}"; src: url("${f.url}") format("${f.format}"); }`,
      `.${f.id} { font-family: "${escaped}", sans-serif; }`
    );
  }
  return rules.join("\n");
}

export function CustomFontsProvider({ children }: { children: ReactNode }) {
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const styleElRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("style");
    el.setAttribute("data-custom-fonts", "true");
    document.head.appendChild(el);
    styleElRef.current = el;
    return () => {
      if (styleElRef.current?.parentNode) {
        styleElRef.current.parentNode.removeChild(styleElRef.current);
      }
      styleElRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!styleElRef.current) return;
    styleElRef.current.textContent = buildCustomFontsStyle(customFonts);
  }, [customFonts]);

  const addFont = useCallback(async (file: File): Promise<void> => {
    const font = await registerFont(file);
    setCustomFonts((prev) => {
      const nameCount = prev.filter((f) => f.fontFamily === font.fontFamily).length;
      const fontFamily =
        nameCount > 0 ? `${font.fontFamily} (${nameCount + 1})` : font.fontFamily;
      return [...prev, { ...font, fontFamily }];
    });
  }, []);

  const removeFont = useCallback((id: string) => {
    setCustomFonts((prev) => {
      const next = prev.filter((f) => f.id !== id);
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ customFonts, addFont, removeFont }),
    [customFonts, addFont, removeFont]
  );

  return (
    <CustomFontsContext.Provider value={value}>
      {children}
    </CustomFontsContext.Provider>
  );
}

export function useCustomFonts() {
  const ctx = useContext(CustomFontsContext);
  if (!ctx) {
    throw new Error("useCustomFonts must be used within CustomFontsProvider");
  }
  return ctx;
}
