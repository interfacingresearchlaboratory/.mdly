import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    providerImportSource: "mdx-components",
  },
});

export const { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
  },
});
