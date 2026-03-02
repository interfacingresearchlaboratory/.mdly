import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown"

import { HORIZONTAL_RULE } from "../editor/transformers/markdown-horizontal-rule-transformer"
import { SMART_SECTION } from "../editor/transformers/markdown-smart-section-transformer"
import { TABLE } from "../editor/transformers/markdown-table-transformer"
import { IMAGE } from "../editor/transformers/markdown-image-transformer"
import { BACKLINK } from "./transformers/markdown-backlink-transformer"

export const MARKDOWN_TRANSFORMERS_LOCAL = [
  CHECK_LIST,
  HORIZONTAL_RULE,
  SMART_SECTION,
  TABLE,
  IMAGE,
  BACKLINK,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]
