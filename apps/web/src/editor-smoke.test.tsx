import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ToolbarlessEditor } from "@editor/ui/editor/toolbarless-editor"

describe("Editor smoke", () => {
  it("renders toolbarless editor with placeholder", () => {
    render(<ToolbarlessEditor placeholder="Start writing…" />)
    // Editor uses aria-placeholder + a sibling div for the placeholder text
    expect(screen.getByText("Start writing…")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })
})
