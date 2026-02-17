"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface MockSeedContextValue {
  seedIndex: number;
  setSeedIndex: (index: number) => void;
}

const MockSeedContext = createContext<MockSeedContextValue>({
  seedIndex: 0,
  setSeedIndex: () => {},
});

export function useMockSeed(): number {
  return useContext(MockSeedContext).seedIndex;
}

export function useMockSeedControls(): MockSeedContextValue {
  return useContext(MockSeedContext);
}

export function MockSeedProvider({ children }: { children: React.ReactNode }) {
  const [seedIndex, setSeedIndex] = useState(0);

  useEffect(() => {
    setSeedIndex(Math.floor(Math.random() * 3));
  }, []);

  return (
    <MockSeedContext.Provider value={{ seedIndex, setSeedIndex }}>
      {children}
    </MockSeedContext.Provider>
  );
}
