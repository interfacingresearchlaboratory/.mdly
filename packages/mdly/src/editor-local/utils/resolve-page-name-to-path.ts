export function getDirPath(filePath: string): string {
  const i = filePath.lastIndexOf("/")
  return i <= 0 ? "" : filePath.slice(0, i)
}

/**
 * Resolves a wiki-style page name to a file path using the workspace file list.
 * Prefers files in the same directory as the current file.
 */
export function resolvePageNameToPath(
  pageName: string,
  workspaceMdFiles: { path: string; name: string }[],
  currentFilePath: string | null
): string {
  const trimmed = pageName.trim()
  if (!trimmed) return ""
  const currentDir = currentFilePath ? getDirPath(currentFilePath) : ""
  const sameFolder: { path: string; name: string }[] = []
  const other: { path: string; name: string }[] = []
  for (const file of workspaceMdFiles) {
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "")
    if (nameWithoutExt === trimmed || file.name === trimmed) {
      if (currentDir && getDirPath(file.path) === currentDir) {
        sameFolder.push(file)
      } else {
        other.push(file)
      }
    }
  }
  const match = sameFolder[0] ?? other[0]
  return match ? match.path : ""
}
