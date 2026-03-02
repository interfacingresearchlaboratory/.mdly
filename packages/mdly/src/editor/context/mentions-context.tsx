import { createContext, useContext, ReactNode } from "react"

export type MentionEntity = {
  id: string
  type: string
  label: string
}

export type Project = {
  _id: string
  title: string
}

export type Task = {
  _id: string
  title: string
}

type MentionsContextValue = {
  entities: MentionEntity[]
  getHref?: (type: string, id: string) => string | undefined
  renderIcon?: (type: string) => ReactNode
  projects: Project[] | null | undefined
  tasks: Task[] | null | undefined
}

const MentionsContext = createContext<MentionsContextValue>({
  entities: [],
  projects: null,
  tasks: null,
})

export function MentionsContextProvider({
  children,
  entities = [],
  getHref,
  renderIcon,
  projects,
  tasks,
}: {
  children: ReactNode
  entities?: MentionEntity[]
  getHref?: (type: string, id: string) => string | undefined
  renderIcon?: (type: string) => ReactNode
  projects?: Project[] | null
  tasks?: Task[] | null
}) {
  return (
    <MentionsContext.Provider
      value={{ entities, getHref, renderIcon, projects, tasks }}
    >
      {children}
    </MentionsContext.Provider>
  )
}

export function useMentionsContext(): MentionsContextValue {
  return useContext(MentionsContext)
}
