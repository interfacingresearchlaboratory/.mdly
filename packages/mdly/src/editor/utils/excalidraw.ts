const SCENE_PATH_REGEXP = /\/scene\//i

function isExcalidrawHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  return normalized === "excalidraw.com" || normalized.endsWith(".excalidraw.com")
}

function parseUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  try {
    return new URL(trimmed)
  } catch {
    return null
  }
}

function hashParams(hash: string): URLSearchParams {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash
  return new URLSearchParams(normalized)
}

export function isLikelyExcalidrawSceneUrl(raw: string): boolean {
  const url = parseUrl(raw)
  if (!url) return false
  if (url.protocol !== "https:" && url.protocol !== "http:") return false

  const isExcalidraw = isExcalidrawHost(url.hostname)
  const path = url.pathname.toLowerCase()
  const search = url.searchParams
  const hash = hashParams(url.hash)

  return (
    SCENE_PATH_REGEXP.test(path) ||
    (isExcalidraw && path.includes("/embed")) ||
    search.has("json") ||
    search.has("room") ||
    search.has("id") ||
    hash.has("json") ||
    hash.has("room") ||
    hash.has("id")
  )
}

export function toExcalidrawEmbedUrl(raw: string): string | null {
  const url = parseUrl(raw)
  if (!url || !isLikelyExcalidrawSceneUrl(raw)) return null

  // Hint Excalidraw to hide editor chrome when embeddable.
  if (!url.searchParams.has("embed")) {
    url.searchParams.set("embed", "true")
  }
  return url.toString()
}

export function extractExcalidrawUrlFromEmbedHtml(html: string): string | null {
  if (typeof DOMParser === "undefined") {
    const iframeSrcRegExp = /<iframe[^>]*\s+src=["']([^"']+)["'][^>]*>/gi
    let match: RegExpExecArray | null = iframeSrcRegExp.exec(html)
    while (match) {
      const src = match[1]
      if (src && isLikelyExcalidrawSceneUrl(src)) return src
      match = iframeSrcRegExp.exec(html)
    }
    return null
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  const iframes = Array.from(doc.querySelectorAll("iframe"))

  for (const iframe of iframes) {
    const src = iframe.getAttribute("src")
    if (!src) continue
    if (isLikelyExcalidrawSceneUrl(src)) return src
  }

  return null
}

export function extractSingleUrlText(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  if (/\s/.test(trimmed)) return null
  return parseUrl(trimmed) ? trimmed : null
}
