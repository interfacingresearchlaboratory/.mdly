import * as React from "react"
import { createContext, useContext, ReactNode } from "react"

export type SameFolderFile = { path: string; name: string }

type BacklinksContextValue = {
  sameFolderMdFiles: SameFolderFile[]
  currentFilePath: string | null
  onOpenBacklink: ((path: string) => void) | null
}

const BacklinksContext = createContext<BacklinksContextValue>({
  sameFolderMdFiles: [],
  currentFilePath: null,
  onOpenBacklink: null,
})

export function BacklinksContextProvider({
  children,
  sameFolderMdFiles = [],
  currentFilePath = null,
  onOpenBacklink = null,
}: {
  children: ReactNode
  sameFolderMdFiles?: SameFolderFile[]
  currentFilePath?: string | null
  onOpenBacklink?: ((path: string) => void) | null
}) {
  const value = React.useMemo<BacklinksContextValue>(
    () => ({ sameFolderMdFiles, currentFilePath, onOpenBacklink }),
    [sameFolderMdFiles, currentFilePath, onOpenBacklink]
  )
  return (
    <BacklinksContext.Provider value={value}>
      {children}
    </BacklinksContext.Provider>
  )
}

export function useBacklinksContext(): BacklinksContextValue {
  return useContext(BacklinksContext)
}
