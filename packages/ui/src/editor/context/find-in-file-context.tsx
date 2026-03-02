"use client";

import { createContext, useContext, type ReactNode } from "react";

export interface FindInFileContextValue {
  query: string;
  setQuery: (q: string) => void;
  caseSensitive: boolean;
  setCaseSensitive: (v: boolean) => void;
  wholeWord: boolean;
  setWholeWord: (v: boolean) => void;
  currentIndex: number;
  setCurrentIndex: (i: number) => void;
  totalMatches: number;
  setTotalMatches: (n: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
  focusedPaneId: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const FindInFileContext = createContext<FindInFileContextValue | null>(null);

export function FindInFileProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FindInFileContextValue;
}) {
  return (
    <FindInFileContext.Provider value={value}>
      {children}
    </FindInFileContext.Provider>
  );
}

export function useFindInFileContext(): FindInFileContextValue | null {
  return useContext(FindInFileContext);
}

export function useFindInFileContextOrThrow(): FindInFileContextValue {
  const ctx = useContext(FindInFileContext);
  if (ctx == null) {
    throw new Error("useFindInFileContextOrThrow must be used within FindInFileProvider");
  }
  return ctx;
}
