import { docs, meta } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import { formatDate } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { Separator } from "@editor/ui/separator";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";

// _runtime.doc() returns a collection - convert to files array format
// docs is created from: _runtime.doc([{ info: {path}, data }])
const docsAsAny = docs as any;

// The fumadocs collection from _runtime.doc() wraps the original array
// We need to access the original array structure with both info and data
// Try multiple strategies to extract the full structure
let docsArray: any[] = [];

if (docsAsAny && typeof docsAsAny === 'object') {
  // Strategy 1: Check if it's already the array we need
  if (Array.isArray(docsAsAny) && docsAsAny.length > 0 && docsAsAny[0]?.info) {
    docsArray = docsAsAny;
  }
  // Strategy 2: Check for internal array properties
  else if (docsAsAny._items && Array.isArray(docsAsAny._items)) {
    docsArray = docsAsAny._items;
  } else if (docsAsAny.items && Array.isArray(docsAsAny.items)) {
    docsArray = docsAsAny.items;
  } else if (docsAsAny._array && Array.isArray(docsAsAny._array)) {
    docsArray = docsAsAny._array;
  }
  // Strategy 3: Try to access via collection methods or properties
  else if (docsAsAny.length !== undefined) {
    // Get all property names (including non-enumerable)
    const allKeys = [
      ...Object.getOwnPropertyNames(docsAsAny),
      ...Object.getOwnPropertySymbols(docsAsAny),
      ...(docsAsAny.__proto__ ? Object.getOwnPropertyNames(docsAsAny.__proto__) : [])
    ];
    
    // Look for any array property that might contain the original structure
    for (const key of allKeys) {
      try {
        const value = (docsAsAny as any)[key];
        if (Array.isArray(value) && value.length > 0) {
          // Check if this looks like our target structure
          const firstItem = value[0];
          if (firstItem && (firstItem.info || (firstItem.path && firstItem.data))) {
            docsArray = value;
            break;
          }
        }
      } catch (e) {
        // Skip inaccessible properties
      }
    }
    
    // Strategy 4: Try to use collection methods that might give us full structure
    if (docsArray.length === 0) {
      // Try entries() if it exists (like Map)
      if (typeof (docsAsAny as any).entries === 'function') {
        try {
          const entries = Array.from((docsAsAny as any).entries()) as [any, any][];
          if (entries.length > 0) {
            // entries() might give us [key, value] pairs where value has info/data
            const firstEntry = entries[0];
            if (Array.isArray(firstEntry) && firstEntry[1] && (firstEntry[1].info || firstEntry[1].data)) {
              docsArray = entries.map(([key, value]: [any, any]) => value);
            }
          }
        } catch (e) {
          // entries() failed
        }
      }
      
      // Strategy 5: Try to reconstruct by accessing each index
      // and checking if we can get both data and reconstruct path
      if (docsArray.length === 0) {
        const reconstructed: any[] = [];
        for (let i = 0; i < docsAsAny.length; i++) {
          const item = docsAsAny[i];
          if (item) {
            // Try to get info from the item or from collection metadata
            const info = item.info || (item as any).__info;
            const data = item.data || item;
            
            // If we have data but no info, we might need to reconstruct the path
            // from the collection's internal mapping or from the data itself
            if (data && !info) {
              // Try to get path from collection's file mapping if it exists
              const path = item.path || (item as any).__path || (item as any)._path;
              if (path) {
                reconstructed.push({ info: { path }, data });
              } else {
                // Last resort: try to infer from data or collection structure
                reconstructed.push({ info: { path: '' }, data });
              }
            } else if (info && data) {
              reconstructed.push({ info, data });
            } else if (item.info || item.data) {
              reconstructed.push(item);
            }
          }
        }
        if (reconstructed.length > 0) {
          docsArray = reconstructed;
        }
      }
    }
  }
  // Strategy 6: Try iteration (but this usually only gives data)
  else if (docsAsAny && typeof docsAsAny[Symbol.iterator] === 'function') {
    try {
      const iterated = Array.from(docsAsAny) as any[];
      const firstItem = iterated[0] as any;
      if (iterated.length > 0 && (firstItem?.info || firstItem?.data)) {
        docsArray = iterated;
      }
    } catch (e) {
      // Iterator failed
    }
  }
}

// Map the docs array to page files format expected by the loader
// The loader expects: { type: 'page', path: 'relative/path', data: {...} }
const pageFiles = docsArray.map((doc: any, index: number) => {
  // Try multiple ways to get the path from the doc structure
  let path = "";
  
  // Method 1: From info.path (original structure) - this is the most reliable
  if (doc?.info?.path) {
    path = doc.info.path;
  }
  // Method 2: Extract filename from absolutePath if path is missing
  else if (doc?.info?.absolutePath) {
    const absolutePath = doc.info.absolutePath;
    const filename = absolutePath.split('/').pop() || '';
    path = filename;
  }
  // Method 3: Direct path property
  else if (doc?.path) {
    path = doc.path;
  }
  // Method 4: Try to get from collection's internal mapping
  else if (docsAsAny && typeof docsAsAny === 'object' && docsAsAny.length !== undefined) {
    // Try to access path via collection methods or properties
    // Fumadocs might store file paths in a separate mapping
    const collectionPaths = (docsAsAny as any)._paths || (docsAsAny as any).paths || (docsAsAny as any).filePaths;
    if (collectionPaths && Array.isArray(collectionPaths) && collectionPaths[index]) {
      path = collectionPaths[index];
    }
  }
  // Method 5: Fallback to index-based path to ensure uniqueness
  if (!path) {
    path = `entry-${index}`;
  }
  
  // Get data - it might be directly on doc or in doc.data
  const data = doc?.data || doc;
  
  // Remove .mdx extension and handle path
  let cleanPath = path.replace(/\.mdx$/, "");
  
  return {
    type: "page" as const,
    path: cleanPath,
    data,
  };
});

// meta from _runtime.meta([]) is an array
const metaArray = Array.isArray(meta) ? meta : [];
const metaFiles = metaArray.map((m: any) => ({
  type: "meta" as const,
  path: m?.info?.path || m?.path || "meta.json",
  data: m?.data || m || {},
}));

const source = loader({
  baseUrl: "/",
  source: {
    files: [...pageFiles, ...metaFiles],
  },
});

interface ChangelogData {
  date: string;
  version?: string;
  tags?: string[];
  body: React.ComponentType;
}

interface ChangelogPage {
  url: string;
  data: ChangelogData;
}

export default function HomePage() {
  const pages = source.getPages();
  
  // Map fumadocs pages to ChangelogPage format
  const allPages = pages
    .map((page): ChangelogPage | null => {
      // Access page.data with type assertion since body exists at runtime
      const pageData = page.data as any;
      
      // Ensure required date property exists
      if (!pageData.date || !pageData.body) {
        return null;
      }
      
      return {
        url: page.url,
        data: {
          date: pageData.date as string,
          version: pageData.version as string | undefined,
          tags: pageData.tags as string[] | undefined,
          body: pageData.body as React.ComponentType,
        },
      };
    })
    .filter((page): page is ChangelogPage => page !== null);
  
  const sortedChangelogs = allPages.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <Hero imageUrl="" />
      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-32 flex-1 w-full">
        <div className="relative">
          {sortedChangelogs.map((changelog, index) => {
            const MDX = changelog.data.body;
            const date = new Date(changelog.data.date);
            const formattedDate = formatDate(date);
            const isLastItem = index === sortedChangelogs.length - 1;

            return (
              <div key={changelog.url} id={changelog.data.date} className="relative scroll-mt-32">
                <div className="flex flex-col md:flex-row gap-y-6">
                  <div className="md:w-48 flex-shrink-0">
                    <div className="md:sticky md:top-24 pb-10">
                      <time className="text-sm font-medium text-muted-foreground block mb-3">
                        {formattedDate}
                      </time>

                      {changelog.data.version && (
                        <div className="inline-flex relative z-10 items-center justify-center h-10 px-3 text-foreground border border-border rounded-lg text-sm font-medium">
                          {changelog.data.version}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="flex-1 md:pl-8 relative pb-10">
                    {/* Vertical timeline line */}
                    <div className={`hidden md:block absolute top-2 left-0 w-px bg-border ${isLastItem ? 'h-[calc(100%-2.5rem)]' : 'h-full'}`}>
                      {/* Timeline dot */}
                      <div className="hidden md:block absolute -translate-x-1/2 size-2 bg-primary rounded-full z-10" />
                    </div>

                    <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-medium prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-h1:text-5xl [&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0">
                      <MDX />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Separator />
      <Footer />
    </div>
  );
}
