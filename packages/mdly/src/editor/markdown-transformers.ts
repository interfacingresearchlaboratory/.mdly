import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"

import { COLUMNS } from "./transformers/markdown-columns-transformer"
import { HORIZONTAL_RULE } from "./transformers/markdown-horizontal-rule-transformer"
import { SMART_SECTION } from "./transformers/markdown-smart-section-transformer"
import { TABLE } from "./transformers/markdown-table-transformer"
import { IMAGE } from "./transformers/markdown-image-transformer"
import { EXCALIDRAW } from "./transformers/markdown-excalidraw-transformer"

export const MARKDOWN_TRANSFORMERS = [
  CHECK_LIST,
  HORIZONTAL_RULE,
  SMART_SECTION,
  TABLE,
  COLUMNS,
  IMAGE,
  EXCALIDRAW,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]
