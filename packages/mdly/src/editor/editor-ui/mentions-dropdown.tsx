import * as React from "react"
import { JSX, useRef, useEffect } from "react"
import { Layers, SquareSlash } from "lucide-react"
import type { LexicalEditor } from "lexical"

type MentionItem = {
  id: string
  type: "project" | "task"
  label: string
}

interface MentionsDropdownProps {
  editor: LexicalEditor
  positionRef: React.MutableRefObject<{ top: number; left: number } | null>
  items: MentionItem[]
  selectedIndex: number
  onSelect: (item: MentionItem) => void
  onClose: () => void
}

export function MentionsDropdown({
  editor,
  positionRef,
  items,
  selectedIndex,
  onSelect,
  onClose: _onClose,
}: MentionsDropdownProps): JSX.Element | null {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Group items by type
  const tasks = items.filter((item) => item.type === "task").slice(0, 5)
  const projects = items.filter((item) => item.type === "project").slice(0, 2)

  // Calculate total items for index mapping
  const totalTasks = tasks.length
  const totalProjects = projects.length

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [selectedIndex])

  // Position dropdown - update position from ref or calculate from selection
  useEffect(() => {
    if (!dropdownRef.current) return

    const updatePosition = () => {
      if (!dropdownRef.current) return

      // Try to use position from ref first
      if (positionRef.current) {
        dropdownRef.current.style.position = "fixed"
        dropdownRef.current.style.top = `${positionRef.current.top}px`
        dropdownRef.current.style.left = `${positionRef.current.left}px`
        dropdownRef.current.style.zIndex = "50"
        return
      }

      // Fallback: calculate from native selection
      const nativeSelection = window.getSelection()
      const rootElement = editor.getRootElement()

      if (nativeSelection && nativeSelection.rangeCount > 0 && rootElement) {
        try {
          const range = nativeSelection.getRangeAt(0)
          const rangeRect = range.getBoundingClientRect()

          dropdownRef.current.style.position = "fixed"
          dropdownRef.current.style.top = `${rangeRect.bottom + 4}px`
          dropdownRef.current.style.left = `${rangeRect.left}px`
          dropdownRef.current.style.zIndex = "50"
        } catch {
          // If positioning fails, silently continue
        }
      }
    }

    updatePosition()

    // Continuously update position while dropdown is open (for typing)
    const intervalId = setInterval(() => {
      requestAnimationFrame(updatePosition)
    }, 100)

    // Update position on scroll/resize
    const handleUpdate = () => {
      requestAnimationFrame(updatePosition)
    }

    window.addEventListener("scroll", handleUpdate, true)
    window.addEventListener("resize", handleUpdate)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("scroll", handleUpdate, true)
      window.removeEventListener("resize", handleUpdate)
    }
  }, [editor, positionRef])

  if (tasks.length === 0 && projects.length === 0) {
    return null
  }

  const getItemForIndex = (index: number): MentionItem | null => {
    if (index < totalTasks) {
      return tasks[index] ?? null
    } else if (index < totalTasks + totalProjects) {
      return projects[index - totalTasks] ?? null
    }
    return null
  }

  const selectedItem = getItemForIndex(selectedIndex)

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 w-64 max-h-80 overflow-auto bg-popover border border-border rounded-md shadow-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tasks Section */}
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
          Tasks
        </div>
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const isSelected = selectedIndex === index && selectedItem?.type === "task"
            return (
              <button
                key={`task-${task.id}`}
                ref={isSelected ? selectedRef : null}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent ${
                  isSelected ? "bg-accent" : ""
                }`}
                onClick={() => onSelect(task)}
              >
                <SquareSlash size={14} className="flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{task.label}</span>
              </button>
            )
          })
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">No tasks found</div>
        )}
      </div>

      {/* Projects Section */}
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t border-b border-border">
          Projects
        </div>
        {projects.length > 0 ? (
          projects.map((project, index) => {
            const isSelected =
              selectedIndex === totalTasks + index && selectedItem?.type === "project"
            return (
              <button
                key={`project-${project.id}`}
                ref={isSelected ? selectedRef : null}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent ${
                  isSelected ? "bg-accent" : ""
                }`}
                onClick={() => onSelect(project)}
              >
                <Layers size={14} className="flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{project.label}</span>
              </button>
            )
          })
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">No projects found</div>
        )}
      </div>
    </div>
  )
}
