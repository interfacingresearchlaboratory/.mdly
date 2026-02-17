"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@editor/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@editor/ui/sheet";
import { Button } from "@editor/ui/button";
import { Menu, Mail } from "lucide-react";
import { cn } from "@editor/ui/utils";
import { getSectionTitle, getSectionOrder } from "@/lib/sidebar-sections";
import { DynamicIcon } from "@/lib/icon-helper";
import { ThemeToggle } from "./theme-toggle";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "@editor/ui/logo";

interface DocsSidebarProps {
  tree: any; // Can be array or root object with children
  className?: string;
}

// Helper function to format folder names: remove hyphens and capitalize each word
function formatFolderName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function DocsSidebar({ tree, className }: DocsSidebarProps) {
  const pathname = usePathname();
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset sidebar state on navigation
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  // Render a single page item with icon
  const renderPageItem = (item: any, index: number) => {
    const url = item.url || "";
    const name = item.name || item.title || "Untitled";
    const icon = item.data?.icon || item.icon;
    const isActive = pathname === url || pathname === url + "/";
    
    return (
      <Link
        key={url || index}
        href={url}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        onClick={() => setOpenMobile(false)}
      >
        {icon && <DynamicIcon name={icon} className="h-4 w-4 flex-shrink-0" />}
        <span>{name}</span>
      </Link>
    );
  };

  // Render tree items (for nested structures). depth increases indentation for nested folders.
  const renderTree = (tree: any, depth = 0): React.ReactNode => {
    // Handle root object with children property (fumadocs format)
    if (tree && !Array.isArray(tree) && tree.children) {
      return renderTree(tree.children, depth);
    }
    
    if (!tree || !Array.isArray(tree)) return null;

    const nestedIndent = depth > 0 ? "pl-5" : "pl-2";

    return tree.map((item, index) => {
      if (!item) return null;

      // Handle page items - fumadocs tree uses 'url' property for pages
      if (item.url && !item.children) {
        return renderPageItem(item, index);
      }

      // Handle folder items - fumadocs tree uses 'children' property for folders
      if (item.children && Array.isArray(item.children)) {
        const folderName = item.name || item.title || "Folder";
        const folderPages = item.children || [];
        const hasActiveChild = folderPages.some(
          (child: any) => {
            const childUrl = child?.url || "";
            return childUrl === pathname || childUrl === pathname + "/";
          }
        );

        // Check if this folder matches a section
        const sectionTitle = getSectionTitle(folderName);
        const displayTitle = sectionTitle || formatFolderName(folderName);

        return (
          <Accordion
            key={folderName || index}
            type="multiple"
            defaultValue={[folderName]}
            className="w-full"
          >
            <AccordionItem value={folderName} className="border-none">
              <AccordionTrigger className={cn(
                "px-2 py-1.5 text-sm font-medium hover:no-underline rounded-md transition-colors",
                !hasActiveChild && "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                {displayTitle}
              </AccordionTrigger>
              <AccordionContent className="pt-0.5 pb-1.5">
                <div className={cn("space-y-0.5", nestedIndent)}>
                  {renderTree(folderPages, depth + 1)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }

      // Handle items with both url and children (folder with index page)
      if (item.url && item.children && Array.isArray(item.children)) {
        const folderName = item.name || item.title || "Folder";
        const folderPages = item.children || [];
        const hasActiveChild = folderPages.some(
          (child: any) => {
            const childUrl = child?.url || "";
            return childUrl === pathname || childUrl === pathname + "/";
          }
        ) || pathname === item.url || pathname === item.url + "/";

        const sectionTitle = getSectionTitle(folderName);
        const displayTitle = sectionTitle || formatFolderName(folderName);

        return (
          <Accordion
            key={folderName || index}
            type="multiple"
            defaultValue={[folderName]}
            className="w-full"
          >
            <AccordionItem value={folderName} className="border-none">
              <AccordionTrigger className={cn(
                "px-3 py-2 text-sm font-medium hover:no-underline rounded-md transition-colors",
                !hasActiveChild && "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}>
                {displayTitle}
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-2">
                <div className={cn("space-y-1", nestedIndent)}>
                  {item.url && renderPageItem(item, index)}
                  {renderTree(folderPages, depth + 1)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      }

      return null;
    });
  };

  // Normalize tree - handle root object or array
  let normalizedTree: any[] = [];
  
  if (tree) {
    if (Array.isArray(tree)) {
      normalizedTree = tree;
    } else if (tree && typeof tree === 'object' && 'children' in tree) {
      normalizedTree = Array.isArray(tree.children) ? tree.children : [];
    } else if (tree && typeof tree === 'object') {
      // Try to extract children from any property
      const keys = Object.keys(tree);
      if (keys.length > 0) {
      const firstKey = keys[0];
      if (firstKey && Array.isArray((tree as any)[firstKey])) {
        normalizedTree = (tree as any)[firstKey];
      }
    }
  }
  }


  // Separate Overview from other items and organize by sections
  const organizeSidebar = (items: any[]) => {
    const overviewItem = items.find((item: any) => {
      const url = item.url || "";
      const name = item.name || item.title || "";
      return url === "/overview" || url === "/" || name === "Overview";
    });

    const otherItems = items.filter((item: any) => {
      const url = item.url || "";
      const name = item.name || item.title || "";
      return !(url === "/overview" || url === "/" || name === "Overview");
    });

    // Sort other items by section order
    const sortedItems = [...otherItems].sort((a, b) => {
      const folderA = a.name || a.title || "";
      const folderB = b.name || b.title || "";
      return getSectionOrder(folderA) - getSectionOrder(folderB);
    });

    return { overviewItem, sortedItems };
  };

  const { overviewItem, sortedItems } = organizeSidebar(normalizedTree);

  // If no items found, show a message (in development)
  const hasContent = normalizedTree.length > 0;

  // Get the overview URL - use the item's URL if available, otherwise default to "/overview"
  const overviewUrl = overviewItem?.url || "/overview";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-3 h-14 flex items-center border-b box-border">
        <Link href={overviewUrl} className="hover:opacity-80 transition-opacity">
          <h2 className="font-medium text-lg"><Logo/> Docs</h2>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {overviewItem && (
          <div className="mb-1">
            {renderPageItem(overviewItem, 0)}
          </div>
        )}
        {sortedItems.length > 0 ? (
          <div className="space-y-1">
            {renderTree(sortedItems)}
          </div>
        ) : normalizedTree.length > 1 ? (
          // Fallback: if no items were organized but we have multiple items, render all except overview
          <div className="space-y-1">
            {renderTree(normalizedTree.filter((item: any) => {
              const url = item.url || "";
              const name = item.name || item.title || "";
              return !(url === "/overview" || url === "/" || name === "Overview");
            }))}
          </div>
        ) : null}
      </div>
      <div className="border-t px-3 py-3 flex items-center justify-between gap-2">
        <Link
          href={`mailto:${siteConfig.supportEmail}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          <span>Contact</span>
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-40 h-9 w-9"
          onClick={() => setOpenMobile(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent side="left" className="w-80 p-0 flex flex-col">
            <SheetHeader className="px-3 h-14 flex items-center border-b box-border">
              <Link href={overviewUrl} onClick={() => setOpenMobile(false)} className="hover:opacity-80 transition-opacity">
                <SheetTitle>MONOid Docs</SheetTitle>
              </Link>
              <SheetDescription className="sr-only">Documentation navigation menu</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {overviewItem && (
                <div className="mb-1">
                  {renderPageItem(overviewItem, 0)}
                </div>
              )}
              {sortedItems.length > 0 ? (
                <div className="space-y-1">
                  {renderTree(sortedItems)}
                </div>
              ) : normalizedTree.length > 1 ? (
                // Fallback: if no items were organized but we have multiple items, render all except overview
                <div className="space-y-1">
                  {renderTree(normalizedTree.filter((item: any) => {
                    const url = item.url || "";
                    const name = item.name || item.title || "";
                    return !(url === "/overview" || url === "/" || name === "Overview");
                  }))}
                </div>
              ) : null}
            </div>
            <div className="border-t px-3 py-3 flex items-center justify-between gap-2">
              <Link
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                onClick={() => setOpenMobile(false)}
              >
                <Mail className="h-4 w-4" />
                <span>Contact</span>
              </Link>
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col md:w-64 md:border-r md:bg-background md:fixed md:top-0 md:left-0",
        "md:h-screen md:overflow-y-auto md:overflow-x-hidden z-10",
        className
      )}
    >
      {sidebarContent}
    </aside>
  );
}
