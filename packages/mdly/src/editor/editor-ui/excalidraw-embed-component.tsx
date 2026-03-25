import { ExternalLink } from "lucide-react"

export function ExcalidrawEmbedComponent({
  embedUrl,
  sourceUrl,
}: {
  embedUrl: string
  sourceUrl: string
}) {
  return (
    <div className="my-4 overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Excalidraw</span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={(event) => event.stopPropagation()}
        >
          Open
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="relative w-full pt-[62.5%]">
        <iframe
          src={embedUrl}
          title="Excalidraw embed"
          className="absolute inset-0 h-full w-full border-0 bg-background"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        />
      </div>
    </div>
  )
}
