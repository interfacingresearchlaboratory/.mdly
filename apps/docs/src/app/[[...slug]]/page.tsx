import { source } from "@/lib/source";
import { notFound, redirect } from "next/navigation";
import { getMDXComponents } from "@/../mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsTOC } from "@/components/docs-toc";
import { CopyMarkdownButton } from "@/components/copy-markdown-button";
import { DocsNavigation } from "@/components/docs-navigation";
import { getDocsNavigation } from "@/lib/docs-navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPageRoute(props: PageProps) {
  const params = await props.params;
  
  // Redirect root to overview
  if (!params.slug || params.slug.length === 0) {
    redirect('/overview');
  }
  
  const page = source.getPage(params.slug || []);

  if (!page) {
    notFound();
  }

  // Access properties that exist at runtime but aren't in the type definition
  const pageData = page.data as any;
  const MDX = pageData.body;
  const toc = pageData.toc;

  // Check if this is the overview page
  const isOverviewPage = params.slug?.length === 1 && params.slug[0] === 'overview';

  // Get next and previous pages for navigation
  const { previousPage, nextPage } = getDocsNavigation(params.slug || []);

  return (
    <div className={`w-full ${isOverviewPage ? '' : 'flex'}`}>
      <div className={`${isOverviewPage ? 'w-full' : 'flex-1'} max-w-4xl mx-auto px-6 pt-20 pb-8`}>
        <h1 className="text-4xl font-medium mb-4">{page.data.title}</h1>
        {page.data.description && (
          <p className="text-lg text-muted-foreground mb-8">{page.data.description}</p>
        )}
        {!isOverviewPage && <CopyMarkdownButton slug={params.slug || []} />}
        <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-headings:font-medium prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance prose-h1:text-5xl [&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0">
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </div>
        <DocsNavigation previousPage={previousPage} nextPage={nextPage} />
      </div>
      {!isOverviewPage && <DocsTOC toc={toc} />}
    </div>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug || []);
  if (!page) {
    return {};
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
