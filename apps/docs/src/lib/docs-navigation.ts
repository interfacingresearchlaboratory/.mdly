import { source } from "./source";
import { getSectionOrder } from "@/lib/sidebar-sections";

/**
 * Flattens a tree structure into a linear array of pages
 * This matches the order they appear in the sidebar
 */
function flattenTree(tree: any[]): Array<{ url: string; title: string }> {
  const result: Array<{ url: string; title: string }> = [];

  function traverse(items: any[]) {
    for (const item of items) {
      if (item.url && !item.children) {
        // It's a page
        result.push({
          url: item.url,
          title: item.title || item.name || "Untitled",
        });
      } else if (item.children && Array.isArray(item.children)) {
        // It's a folder - first add the folder's index page if it has one
        if (item.url) {
          result.push({
            url: item.url,
            title: item.title || item.name || "Untitled",
          });
        }
        // Then traverse children
        traverse(item.children);
      }
    }
  }

  traverse(tree);
  return result;
}

/**
 * Gets the next and previous pages for navigation
 */
export function getDocsNavigation(currentSlug: string[]) {
  const pages = source.getPages();
  const currentUrl = currentSlug.length === 0 ? "/" : "/" + currentSlug.join("/");

  // Build tree structure (same as in layout.tsx)
  const treeMap = new Map<string, any>();

  pages.forEach((page) => {
    const url = page.url;
    const segments = url.split("/").filter(Boolean);

    if (segments.length === 0) {
      // Root page
      treeMap.set("", {
        url: "/",
        name: (page.data as any).title || "Home",
        title: (page.data as any).title || "Home",
        icon: (page.data as any).icon,
        data: page.data,
      });
    } else if (segments.length === 1) {
      // Top-level page
      treeMap.set(segments[0], {
        url: `/${segments[0]}`,
        name: (page.data as any).title || segments[0],
        title: (page.data as any).title || segments[0],
        icon: (page.data as any).icon,
        data: page.data,
      });
    } else {
      // Nested page - create folder structure (supports sub-folders)
      const folderName = segments[0];
      if (!treeMap.has(folderName)) {
        treeMap.set(folderName, {
          name: folderName,
          title: folderName,
          children: [],
        });
      }
      // Walk into sub-folders for paths deeper than 2 segments
      let currentLevel = treeMap.get(folderName);
      for (let i = 1; i < segments.length - 1; i++) {
        const subName = segments[i];
        if (!subName) continue;
        let existing = currentLevel.children.find(
          (c: any) => c.name === subName && Array.isArray(c.children)
        );
        if (!existing) {
          existing = { name: subName, title: subName, children: [] };
          currentLevel.children.push(existing);
        }
        currentLevel = existing;
      }
      currentLevel.children.push({
        url: `/${segments.join("/")}`,
        name: (page.data as any).title || segments[segments.length - 1],
        title: (page.data as any).title || segments[segments.length - 1],
        icon: (page.data as any).icon,
        data: page.data,
      });
    }
  });

  const pageTree = Array.from(treeMap.values());

  // Separate overview from other items (same logic as sidebar)
  const overviewItem = pageTree.find((item: any) => {
    const url = item.url || "";
    const name = item.name || item.title || "";
    return url === "/overview" || url === "/" || name === "Overview";
  });

  const otherItems = pageTree.filter((item: any) => {
    const url = item.url || "";
    const name = item.name || item.title || "";
    return !(url === "/overview" || url === "/" || name === "Overview");
  });

  // Sort other items by section order (same as sidebar)
  const sortedItems = [...otherItems].sort((a, b) => {
    const folderA = a.name || a.title || "";
    const folderB = b.name || b.title || "";
    return getSectionOrder(folderA) - getSectionOrder(folderB);
  });

  // Build ordered array: overview first, then other items
  const orderedTree: any[] = [];
  if (overviewItem) {
    orderedTree.push(overviewItem);
  }
  orderedTree.push(...sortedItems);

  // Flatten to get linear order
  const flatPages = flattenTree(orderedTree);

  // Normalize URLs for comparison (remove trailing slashes)
  const normalizeUrl = (url: string) => url.replace(/\/$/, "") || "/";

  // Find current page index
  const normalizedCurrentUrl = normalizeUrl(currentUrl);
  const currentIndex = flatPages.findIndex(
    (page) => normalizeUrl(page.url) === normalizedCurrentUrl
  );

  if (currentIndex === -1) {
    return { previousPage: null, nextPage: null };
  }

  const previousPage =
    currentIndex > 0 ? flatPages[currentIndex - 1] : null;
  const nextPage =
    currentIndex < flatPages.length - 1 ? flatPages[currentIndex + 1] : null;

  return { previousPage, nextPage };
}
