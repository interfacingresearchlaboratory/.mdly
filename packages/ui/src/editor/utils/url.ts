const SUPPORTED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "sms:",
  "tel:",
])

/**
 * Returns whether a URL has meaningful content (host for http(s), path/opaque for others).
 * Rejects protocol-only or empty URLs like "https://" or "".
 */
function isUrlWithContent(parsed: URL): boolean {
  if (SUPPORTED_URL_PROTOCOLS.has(parsed.protocol)) {
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.hostname.length > 0
    }
    // mailto:, tel:, sms: — require non-empty pathname or meaningful href after protocol
    const afterProtocol = parsed.href.slice(parsed.protocol.length).replace(/^\/+/, "")
    return afterProtocol.length > 0
  }
  return false
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (trimmed === "") return "about:blank"
  try {
    const parsedUrl = new URL(trimmed)
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return "about:blank"
    }
    if (!isUrlWithContent(parsedUrl)) {
      return "about:blank"
    }
  } catch {
    return "about:blank"
  }
  return trimmed
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
)

export function validateUrl(url: string): boolean {
  const trimmed = url.trim()
  if (trimmed === "") return false
  if (trimmed === "https://" || trimmed === "http://") return false
  try {
    const parsed = new URL(trimmed)
    if (!SUPPORTED_URL_PROTOCOLS.has(parsed.protocol)) return false
    if (!isUrlWithContent(parsed)) return false
    // For http(s), also require regex match to avoid overly permissive input
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return urlRegExp.test(trimmed)
    }
    return true
  } catch {
    return false
  }
}
