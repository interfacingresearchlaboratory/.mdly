"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../dialog"
import { Button } from "../../button"
import { Input } from "../../input"
import { Label } from "../../label"
import { Kbd } from "../../kbd"
import { validateUrl, sanitizeUrl } from "../utils/url"

export interface LinkUrlDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string) => void
}

export function LinkUrlDialog({
  open,
  onOpenChange,
  onSubmit,
}: LinkUrlDialogProps) {
  const [url, setUrl] = useState("")

  const isValid = validateUrl(url)
  const handleSubmit = useCallback(() => {
    if (!isValid) return
    const safe = sanitizeUrl(url)
    if (!validateUrl(safe)) return
    onSubmit(safe)
    setUrl("")
    onOpenChange(false)
  }, [isValid, url, onSubmit, onOpenChange])

  useEffect(() => {
    if (!open) setUrl("")
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        handleSubmit()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, handleSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add link</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              data-testid="link-url-input"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!isValid}
            onClick={handleSubmit}
            data-testid="link-url-submit"
          >
            Add link
            <span className="ml-2 flex items-center gap-1 text-muted-foreground">
              <Kbd>⌘</Kbd>
              <Kbd>Enter</Kbd>
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
