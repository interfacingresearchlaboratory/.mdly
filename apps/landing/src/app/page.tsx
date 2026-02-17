import { docs } from "../../.source/index";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

// _runtime.doc() returns a collection - convert to files array format
const docsAsAny = docs as any;

// Try multiple ways to get the array from the collection
let docsArray: any[] = [];
if (Array.isArray(docsAsAny)) {
  docsArray = docsAsAny;
} else if (docsAsAny && typeof docsAsAny[Symbol.iterator] === "function") {
  docsArray = Array.from(docsAsAny);
} else if (docsAsAny && docsAsAny.length !== undefined) {
  docsArray = Array.from({ length: docsAsAny.length }, (_, i) => docsAsAny[i]);
} else if (docsAsAny) {
  // Fallback: treat as single item
  docsArray = [docsAsAny];
}

export default function HomePage() {
  // Directly find the landing.mdx file
  const landingDoc =
    docsArray.find((doc: any) => {
      const path = doc?.info?.path || doc?.path || "";
      return path === "landing.mdx";
    }) || docsArray[0]; // Fallback to first item if not found

  if (!landingDoc) {
    return (
        <div className="page-container pt-32">
        <p>Landing content not found</p>
      </div>
    );
  }

  // Extract the MDX component directly from the doc's data
  const landingData = landingDoc?.data || landingDoc;
  const MDX = landingData?.default || landingData?.body || landingData;

  if (!MDX || typeof MDX !== "function") {
    return (
        <div className="page-container pt-32">
        <p>
          MDX component not found. Available keys:{" "}
          {Object.keys(landingData || {}).join(", ")}
        </p>
      </div>
    );
  }

  return (
    <div className="page-container pt-32 flex-1 w-full">
      <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:scroll-mt-8 prose-headings:font-medium prose-headings:text-gray-900 prose-headings:dark:text-gray-100 prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-p:text-lg prose-p:text-gray-600 prose-p:dark:text-gray-400 prose-li:text-gray-600 prose-li:dark:text-gray-400 prose-h1:text-[7.5rem] prose-h1:md:text-[9rem] prose-h1:mb-6 prose-h2:text-[4.5rem] prose-h2:md:text-[6rem] prose-h3:text-[3rem] prose-h3:md:text-[3.75rem] [&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0 [&>hr]:my-16 [&>hr]:md:my-24 [&>hr]:border-border [&_.hero-heading>h2]:!text-5xl [&_.hero-heading>h2]:md:!text-6xl [&_.hero-heading>h2]:lg:!text-7xl">
        <MDX />
      </div>
    </div>
  );
}
