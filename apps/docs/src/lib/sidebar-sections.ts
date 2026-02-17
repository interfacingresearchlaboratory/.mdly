export interface SidebarSection {
  title: string;
  folder?: string;
  order: number;
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Getting Started",
    folder: "getting-started",
    order: 1,
  },
  {
    title: "Guides",
    folder: "guides",
    order: 2,
  },
  {
    title: "Admin",
    folder: "admin",
    order: 3,
  },
  {
    title: "Scouts & Assets",
    folder: "scouts-assets",
    order: 4,
  },
  {
    title: "Organisation",
    folder: "organisation",
    order: 5,
  },
  {
    title: "Planning",
    folder: "planning",
    order: 6,
  },
  {
    title: "Routines",
    folder: "routines",
    order: 7,
  },
  {
    title: "Reviews",
    folder: "reviews",
    order: 8,
  },
  {
    title: "Integrations",
    folder: "integrations",
    order: 9,
  },
  {
    title: "Projections",
    folder: "projections",
    order: 10,
  },
  {
    title: "Introduction",
    folder: "introduction",
    order: 11,
  },
  {
    title: "Projects & Spaces",
    folder: "projects-spaces",
    order: 12,
  },
  {
    title: "Scouts",
    folder: "scouts",
    order: 13,
  },
  {
    title: "Assets",
    folder: "assets",
    order: 14,
  },
  {
    title: "Recurs",
    folder: "recurs",
    order: 15,
  },
];

// Get section title by folder name
export function getSectionTitle(folderName: string): string | undefined {
  const section = sidebarSections.find(
    (s) => s.folder === folderName || s.title.toLowerCase().replace(/\s+/g, "-") === folderName
  );
  return section?.title;
}

// Get section order by folder name
export function getSectionOrder(folderName: string): number {
  const section = sidebarSections.find(
    (s) => s.folder === folderName || s.title.toLowerCase().replace(/\s+/g, "-") === folderName
  );
  return section?.order ?? 999; // Default to end if not found
}
