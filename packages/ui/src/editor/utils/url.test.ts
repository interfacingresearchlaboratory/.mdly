import { describe, expect, it } from "vitest"
import { sanitizeUrl, validateUrl } from "./url"

describe("validateUrl", () => {
  it("rejects empty string", () => {
    expect(validateUrl("")).toBe(false)
    expect(validateUrl("   ")).toBe(false)
  })

  it("rejects protocol-only URLs", () => {
    expect(validateUrl("https://")).toBe(false)
    expect(validateUrl("http://")).toBe(false)
  })

  it("accepts valid http/https URLs with host", () => {
    expect(validateUrl("https://example.com")).toBe(true)
    expect(validateUrl("http://example.com")).toBe(true)
    expect(validateUrl("https://sub.example.com/path?q=1")).toBe(true)
  })

  it("accepts valid mailto and tel", () => {
    expect(validateUrl("mailto:user@example.com")).toBe(true)
    expect(validateUrl("tel:+15551234567")).toBe(true)
  })

  it("rejects unsupported protocols", () => {
    expect(validateUrl("javascript:alert(1)")).toBe(false)
    expect(validateUrl("data:text/html,<script>")).toBe(false)
  })
})

describe("sanitizeUrl", () => {
  it("returns about:blank for empty or whitespace", () => {
    expect(sanitizeUrl("")).toBe("about:blank")
    expect(sanitizeUrl("   ")).toBe("about:blank")
  })

  it("returns about:blank for protocol-only URLs", () => {
    expect(sanitizeUrl("https://")).toBe("about:blank")
    expect(sanitizeUrl("http://")).toBe("about:blank")
  })

  it("returns about:blank for unsupported protocols", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("about:blank")
  })

  it("returns trimmed URL for valid http/https with host", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com")
    expect(sanitizeUrl("  https://example.com  ")).toBe("https://example.com")
  })
})
