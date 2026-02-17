import {
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { LinkNode } from "@lexical/link"
import { AutoLinkNode } from "@lexical/link"
import { ImageNode } from "./nodes/image-node"
import { InlineImageNode } from "./nodes/inline-image-node"
import { AutocompleteNode } from "./nodes/autocomplete-node"
import { HorizontalRuleNode } from "./nodes/horizontal-rule-node"
import { SmartSectionNode } from "./nodes/smart-section-node"
import { MentionNode } from "./nodes/mention-node"

export const nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LinkNode,
  AutoLinkNode,
  ImageNode,
  InlineImageNode,
  AutocompleteNode,
  HorizontalRuleNode,
  SmartSectionNode,
  MentionNode,
]








