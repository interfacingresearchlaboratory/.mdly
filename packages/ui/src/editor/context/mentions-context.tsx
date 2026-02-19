import * as React from "react"
import { createContext, useContext, ReactNode } from "react"

export type Project = {
  _id: string
  title: string
}

export type Task = {
  _id: string
  title: string
}

type MentionsContextValue = {
  projects: Project[] | null | undefined
  tasks: Task[] | null | undefined
}

const MentionsContext = createContext<MentionsContextValue>({
  projects: null,
  tasks: null,
})

export function MentionsContextProvider({
  children,
  projects,
  tasks,
}: {
  children: ReactNode
  projects?: Project[] | null
  tasks?: Task[] | null
}) {
  return (
    <MentionsContext.Provider value={{ projects, tasks }}>
      {children}
    </MentionsContext.Provider>
  )
}

export function useMentionsContext(): MentionsContextValue {
  return useContext(MentionsContext)
}
