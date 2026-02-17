// source.config.ts
import {
  defineConfig,
  defineDocs
} from "fumadocs-mdx/config";
import { z } from "zod";
var source_config_default = defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    providerImportSource: "../mdx-components"
  }
});
var { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      date: z.string(),
      tags: z.array(z.string()).optional(),
      version: z.string().optional()
    })
  }
});
export {
  source_config_default as default,
  docs,
  meta
};
