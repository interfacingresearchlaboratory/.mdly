import {
  defineConfig,
  defineDocs,
} from "fumadocs-mdx/config";
import { z } from "zod";

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    providerImportSource: "mdx-components",
  },
});

const defined = defineDocs({
  dir: "content/docs",
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  },
});

export const docs: any = defined.docs;
export const meta: any = defined.meta;
