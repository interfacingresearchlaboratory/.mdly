import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { $getSelection } from "lexical"

import { useToolbarContext } from "../../../context/toolbar-context"
import { blockTypeToBlockName } from "./block-format-data"
import { SelectItem } from "../../../../select"

export function FormatHeading({ levels = [] }: { levels: HeadingTagType[] }) {
  const { activeEditor, blockType } = useToolbarContext()

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      activeEditor.update(() => {
        const selection = $getSelection()
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      })
    }
  }

  return levels
    .map((level) => {
      const blockConfig = blockTypeToBlockName[level]
      if (!blockConfig) {
        return null
      }

      return (
        <SelectItem
          key={level}
          value={level}
          onPointerDown={() => formatHeading(level)}
        >
          <div className="flex items-center gap-1 font-normal">
            {blockConfig.icon}
            {blockConfig.label}
          </div>
        </SelectItem>
      )
    })
    .filter((item) => item !== null)
}
