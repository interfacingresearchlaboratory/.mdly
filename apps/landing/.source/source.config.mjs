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
var { docs, meta } = defineDocs({
  dir: "content",
  docs: {
    schema: z.object({
      title: z.string(),
      description: z.string().optional()
    })
  }
});
export {
  source_config_default as default,
  docs,
  meta
};
