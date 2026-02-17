"use client"

import { createContext, useContext, ReactNode } from "react"

interface CollaborationContextValue {
  isCollabActive: boolean
}

const CollaborationContext = createContext<CollaborationContextValue>({
  isCollabActive: false,
})

export function CollaborationContextProvider({
  children,
  isCollabActive = false,
}: {
  children: ReactNode
  isCollabActive?: boolean
}) {
  return (
    <CollaborationContext.Provider value={{ isCollabActive }}>
      {children}
    </CollaborationContext.Provider>
  )
}

export function useCollaborationContext(): CollaborationContextValue {
  return useContext(CollaborationContext)
}

