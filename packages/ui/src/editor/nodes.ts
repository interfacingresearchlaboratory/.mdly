import {
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeNode, CodeHighlightNode } from "@lexical/code"
import { LinkNode, AutoLinkNode } from "@lexical/link"
import { CustomLinkNode, CustomAutoLinkNode } from "./nodes/link-node"
import { ImageNode } from "./nodes/image-node"
import { InlineImageNode } from "./nodes/inline-image-node"
import { AutocompleteNode } from "./nodes/autocomplete-node"
import { HorizontalRuleNode } from "./nodes/horizontal-rule-node"
import { SmartSectionNode } from "./nodes/smart-section-node"
import { MentionNode } from "./nodes/mention-node"
import { PlaceholderTextNode } from "./nodes/placeholder-text-node"

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
  CustomLinkNode,
  { replace: LinkNode, with: (node: LinkNode) => new CustomLinkNode(node.getURL(), { rel: node.getRel(), target: node.getTarget(), title: node.getTitle() }) },
  CustomAutoLinkNode,
  { replace: AutoLinkNode, with: (node: AutoLinkNode) => new CustomAutoLinkNode(node.getURL(), { isUnlinked: node.getIsUnlinked(), rel: node.getRel(), target: node.getTarget(), title: node.getTitle() }) },
  ImageNode,
  InlineImageNode,
  AutocompleteNode,
  HorizontalRuleNode,
  SmartSectionNode,
  MentionNode,
  PlaceholderTextNode,
]








