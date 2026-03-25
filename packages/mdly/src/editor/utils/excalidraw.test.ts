import { describe, expect, it } from "vitest"

import {
  extractExcalidrawUrlFromEmbedHtml,
  extractSingleUrlText,
  isLikelyExcalidrawSceneUrl,
  toExcalidrawEmbedUrl,
} from "./excalidraw"

describe("isLikelyExcalidrawSceneUrl", () => {
  it("matches hash json scene links", () => {
    expect(
      isLikelyExcalidrawSceneUrl("https://excalidraw.com/#json=abc,def")
    ).toBe(true)
  })

  it("matches /scene/ links on arbitrary hosts", () => {
    expect(
      isLikelyExcalidrawSceneUrl("https://draw.example.com/scene/123")
    ).toBe(true)
  })

  it("matches readonly links on link.excalidraw.com", () => {
    expect(
      isLikelyExcalidrawSceneUrl("https://link.excalidraw.com/readonly/itpXOE2MWEyaO8wce1RU")
    ).toBe(true)
  })

  it("rejects non-scene urls", () => {
    expect(isLikelyExcalidrawSceneUrl("https://example.com/docs")).toBe(false)
  })
})

describe("toExcalidrawEmbedUrl", () => {
  it("adds embed=true when absent", () => {
    const next = toExcalidrawEmbedUrl("https://excalidraw.com/#json=abc,def")
    expect(next).toContain("embed=true")
  })

  it("returns null for unrelated urls", () => {
    expect(toExcalidrawEmbedUrl("https://example.com")).toBeNull()
  })
})

describe("extractExcalidrawUrlFromEmbedHtml", () => {
  it("extracts iframe source when it looks like excalidraw", () => {
    const html =
      '<iframe src="https://draw.example.com/scene/xyz?foo=bar"></iframe>'
    expect(extractExcalidrawUrlFromEmbedHtml(html)).toBe(
      "https://draw.example.com/scene/xyz?foo=bar"
    )
  })

  it("returns null for non-excalidraw iframe", () => {
    const html = '<iframe src="https://www.youtube.com/embed/abc"></iframe>'
    expect(extractExcalidrawUrlFromEmbedHtml(html)).toBeNull()
  })
})

describe("extractSingleUrlText", () => {
  it("returns a single url token", () => {
    expect(extractSingleUrlText("https://excalidraw.com/#json=abc,def")).toBe(
      "https://excalidraw.com/#json=abc,def"
    )
  })

  it("rejects multi-token text", () => {
    expect(extractSingleUrlText("see https://excalidraw.com/#json=abc")).toBeNull()
  })
})
