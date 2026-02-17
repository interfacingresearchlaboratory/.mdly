// source.config.ts
import {
  defineConfig,
  defineDocs
} from "fumadocs-mdx/config/zod-3";
import { z } from "zod";
var source_config_default = defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    providerImportSource: "mdx-components"
  }
});
var defined = defineDocs({
  dir: "content/docs",
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      icon: z.string().optional()
    })
  }
});
var docs = defined.docs;
var meta = defined.meta;
export {
  source_config_default as default,
  docs,
  meta
};
