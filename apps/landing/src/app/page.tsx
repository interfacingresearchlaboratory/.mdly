export interface DocEntry {
  info?: { path?: string };
  data?: Record<string, unknown>;
}

/**
 * Narrows the Fumadocs doc collection to an array of typed entries.
 * Use this instead of `docs as any` and ad-hoc array detection.
 */
export function getDocsArray(docs: unknown): DocEntry[] {
  if (docs == null) return [];
  if (Array.isArray(docs)) return docs as DocEntry[];
  if (typeof (docs as { length?: number }).length === "number") {
    return Array.from({ length: (docs as { length: number }).length }, (_, i) =>
      (docs as DocEntry[])[i]
    );
  }
  if (typeof (docs as Iterable<DocEntry>)[Symbol.iterator] === "function") {
    return Array.from(docs as Iterable<DocEntry>);
  }
  return [docs as DocEntry];
}

/**
 * Homepage. When Fumadocs is configured, pass the doc collection and use getDocsArray
 * to find landing.mdx and render it. Example usage with Fumadocs:
 *
 *   import { docs } from "@/source";
 *   const docsArray = getDocsArray(docs);
 *   const landingDoc = docsArray.find((d) => d?.info?.path === "landing.mdx") ?? docsArray[0];
 *   const MDX = landingDoc?.data?.default ?? landingDoc?.data?.body;
 *   return <MDX />;
 *
 * Until then, render a simple welcome.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-semibold tracking-tight">mdly</h1>
      <p className="mt-4 text-muted-foreground text-center max-w-md">
        Landing app. Add Fumadocs and use getDocsArray(docs) to render landing.mdx here.
      </p>
      <nav className="mt-8 flex gap-4">
        <a href="/privacy" className="text-primary underline underline-offset-4">
          Privacy
        </a>
        <a href="/terms" className="text-primary underline underline-offset-4">
          Terms
        </a>
      </nav>
    </div>
  );
}
