"use client"

import { Button } from "@editor/ui/button"
import { Kbd } from "@editor/ui/kbd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@editor/ui/tooltip"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useState } from "react"

interface ThemeToggleProps {
  buttonClassName?: string
  iconSize?: string
}

export function ThemeToggle({ buttonClassName, iconSize = "h-4 w-4" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    const current = theme || "system"
    if (current === "light") {
      setTheme("dark")
    } else if (current === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }, [theme, setTheme])

  // Hotkey: x toggles theme (avoids inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active as HTMLElement)?.isContentEditable
      if (isTyping) return

      if (e.key === "x" || e.key === "X") {
        e.preventDefault()
        toggleTheme()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [theme, setTheme, toggleTheme])

  if (!mounted) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={buttonClassName || "h-8 w-8"}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className={iconSize} />
            ) : theme === "dark" ? (
              <Moon className={iconSize} />
            ) : (
              <Monitor className={iconSize} />
            )}
          </Button>
        </TooltipTrigger>
   
        <TooltipContent side="top">
          <div className="flex items-center gap-2">
            <span>Toggle theme</span>
            <Kbd className="dark:bg-primary dark:text-primary-foreground dark:border-gray-300">
              x
            </Kbd>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
