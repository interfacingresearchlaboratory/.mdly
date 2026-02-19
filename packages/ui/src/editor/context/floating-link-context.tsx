import { createContext, useCallback, useContext, useRef, useState } from "react"
import { LinkUrlDialog } from "../plugins/link-url-dialog"

type LinkDialogSubmit = (url: string) => void

const Context = createContext<{
  isLinkEditMode: boolean
  setIsLinkEditMode: (isLinkEditMode: boolean) => void
  openLinkDialog: (onSubmit: LinkDialogSubmit) => void
}>({
  isLinkEditMode: false,
  setIsLinkEditMode: () => {},
  openLinkDialog: () => {},
})

export function FloatingLinkContext({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const linkDialogOnSubmitRef = useRef<LinkDialogSubmit | null>(null)

  const openLinkDialog = useCallback((onSubmit: LinkDialogSubmit) => {
    linkDialogOnSubmitRef.current = onSubmit
    setLinkDialogOpen(true)
  }, [])

  const handleLinkDialogSubmit = useCallback((url: string) => {
    linkDialogOnSubmitRef.current?.(url)
    linkDialogOnSubmitRef.current = null
    setLinkDialogOpen(false)
  }, [])

  return (
    <Context.Provider value={{ isLinkEditMode, setIsLinkEditMode, openLinkDialog }}>
      {children}
      <LinkUrlDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onSubmit={handleLinkDialogSubmit}
      />
    </Context.Provider>
  )
}

export function useFloatingLinkContext() {
  if (!Context) {
    throw new Error(
      "useFloatingLinkContext must be used within a FloatingLinkContext"
    )
  }
  return useContext(Context)
}
