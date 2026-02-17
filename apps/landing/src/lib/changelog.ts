import { loader } from "fumadocs-core/source";

// Import changelog docs from the changelog app
// We need to access the changelog app's source files
// Since we're in a monorepo, we can import from the relative path
let changelogDocs: any = null;
let changelogSource: ReturnType<typeof loader> | null = null;

// Use dynamic import to load changelog source
// This will work at build time when both apps are built together
async function loadChangelogDocs() {
  if (changelogDocs !== null) {
    return changelogDocs;
  }

  try {
    // Try to import from the changelog app's source
    const changelogSourceModule = await import("@changelog/source");
    changelogDocs = changelogSourceModule.docs;
    return changelogDocs;
  } catch (error) {
    // If changelog app isn't available, we'll handle gracefully
    console.warn("Could not load changelog docs:", error);
    changelogDocs = false; // Mark as attempted but failed
    return null;
  }
}

interface ChangelogEntry {
  date: string;
  version?: string;
  tags?: string[];
  title: string;
  url: string;
  description?: string;
}

export async function getRecentChangelogEntries(limit: number = 4): Promise<ChangelogEntry[]> {
  const docs = await loadChangelogDocs();
  if (!docs) {
    return [];
  }

  try {
    // Convert changelog docs to array format
    // The docs structure from _runtime.doc([{ info: {...}, data: ... }, ...])
    const docsAsAny = docs as any;
    let docsArray: any[] = [];
    
    // Strategy 1: Check if it's already the array we need
    if (Array.isArray(docsAsAny)) {
      docsArray = docsAsAny;
    }
    // Strategy 2: Check for internal array properties
    else if (docsAsAny?._items && Array.isArray(docsAsAny._items)) {
      docsArray = docsAsAny._items;
    } else if (docsAsAny?.items && Array.isArray(docsAsAny.items)) {
      docsArray = docsAsAny.items;
    }
    // Strategy 3: Try iteration (this is what was working before)
    else if (docsAsAny && typeof docsAsAny[Symbol.iterator] === 'function') {
      try {
        docsArray = Array.from(docsAsAny);
      } catch (e) {
        // Iterator failed
      }
    }
    // Strategy 4: Try array-like access with reconstruction
    if (docsArray.length === 0 && docsAsAny && typeof docsAsAny.length === 'number') {
      const reconstructed: any[] = [];
      for (let i = 0; i < docsAsAny.length; i++) {
        const item = docsAsAny[i];
        if (item) {
          const info = item.info || (item as any).__info;
          const data = item.data || item;
          if (info && data) {
            reconstructed.push({ info, data });
          } else if (item.info || item.data) {
            reconstructed.push(item);
          } else {
            // Even if structure is unclear, include it
            reconstructed.push(item);
          }
        }
      }
      if (reconstructed.length > 0) {
        docsArray = reconstructed;
      }
    }
    // Strategy 5: Fallback - treat as single item or empty
    if (docsArray.length === 0 && docsAsAny && !Array.isArray(docsAsAny)) {
      // Only treat as single item if it has useful structure
      if (docsAsAny.info || docsAsAny.data) {
        docsArray = [docsAsAny];
      }
    }

    // Map the docs array to page files format expected by the loader
    const pageFiles = docsArray.map((doc: any, index: number) => {
      // Try multiple ways to get the path
      let path = "";
      
      // Method 1: From info.path (most reliable)
      if (doc?.info?.path) {
        path = doc.info.path;
      }
      // Method 2: Extract filename from absolutePath
      else if (doc?.info?.absolutePath) {
        const absolutePath = doc.info.absolutePath;
        const filename = absolutePath.split('/').pop() || '';
        path = filename;
      }
      // Method 3: Direct path property
      else if (doc?.path) {
        path = doc.path;
      }
      // Method 4: Fallback to index-based path to ensure uniqueness
      if (!path) {
        path = `entry-${index}`;
      }
      
      // Get data - it might be directly on doc or in doc.data
      const data = doc?.data || doc;
      
      // Remove .mdx extension
      const cleanPath = path.replace(/\.mdx$/, "");
      
      return {
        type: "page" as const,
        path: cleanPath,
        data,
      };
    });

    // Always recreate the source to ensure we have all pages
    // The module-level cache might be stale or incomplete
    changelogSource = loader({
      baseUrl: "/",
      source: {
        files: pageFiles,
      },
    });

    const pages = changelogSource.getPages();
    
    const entries: ChangelogEntry[] = pages
      .map((page): ChangelogEntry | null => {
        const pageData = page.data as any;
        
        if (!pageData.date || !pageData.title) {
          return null;
        }
        
        // Extract description from frontmatter, or leave undefined
        const description = pageData.description as string | undefined;
        
        return {
          date: pageData.date as string,
          version: pageData.version as string | undefined,
          tags: pageData.tags as string[] | undefined,
          title: pageData.title as string,
          url: page.url,
          description,
        };
      })
      .filter((entry): entry is ChangelogEntry => entry !== null);
    
    // Sort by date (most recent first)
    entries.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    return entries.slice(0, limit);
  } catch (error) {
    console.warn("Error loading changelog entries:", error);
    return [];
  }
}
