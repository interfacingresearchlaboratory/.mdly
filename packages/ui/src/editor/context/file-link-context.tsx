"use client"

import { createContext, useContext } from "react"

const Context = createContext<{
  onFileLinkClick: ((path: string) => void) | undefined
}>({ onFileLinkClick: undefined })

export function FileLinkContext({
  onFileLinkClick,
  children,
}: {
  onFileLinkClick?: (path: string) => void
  children: React.ReactNode
}) {
  return (
    <Context.Provider value={{ onFileLinkClick }}>
      {children}
    </Context.Provider>
  )
}

export function useFileLinkContext() {
  return useContext(Context)
}
