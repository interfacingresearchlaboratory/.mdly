import * as React from "react"
import { createContext, useContext, ReactNode } from "react"

export type MentionEntity = {
  id: string
  type: string
  label: string
}

export type MentionsContextValue = {
  entities: MentionEntity[]
  getHref?: (type: string, id: string) => string | undefined
  renderIcon?: (type: string) => ReactNode
}

const MentionsContext = createContext<MentionsContextValue>({
  entities: [],
})

export function MentionsContextProvider({
  children,
  entities = [],
  getHref,
  renderIcon,
}: {
  children: ReactNode
  entities?: MentionEntity[]
  getHref?: (type: string, id: string) => string | undefined
  renderIcon?: (type: string) => ReactNode
}) {
  const value = React.useMemo<MentionsContextValue>(
    () => ({ entities, getHref, renderIcon }),
    [entities, getHref, renderIcon]
  )
  return (
    <MentionsContext.Provider value={value}>
      {children}
    </MentionsContext.Provider>
  )
}

export function useMentionsContext(): MentionsContextValue {
  return useContext(MentionsContext)
}
