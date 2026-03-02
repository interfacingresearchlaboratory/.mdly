import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list"
import { $setBlocksType } from "@lexical/selection"
import { $createParagraphNode, $getSelection, $isRangeSelection } from "lexical"

import { useToolbarContext } from "../../../context/toolbar-context"
import { blockTypeToBlockName } from "./block-format-data"
import { SelectItem } from "../../../../select"

const BLOCK_FORMAT_VALUE = "bullet"

export function FormatBulletedList() {
  const { activeEditor, blockType } = useToolbarContext()

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const formatBulletedList = () => {
    if (blockType !== "number") {
      activeEditor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    } else {
      formatParagraph()
    }
  }

  const blockConfig = blockTypeToBlockName[BLOCK_FORMAT_VALUE]
  if (!blockConfig) {
    return null
  }

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onPointerDown={formatBulletedList}>
      <div className="flex items-center gap-1 font-normal">
        {blockConfig.icon}
        {blockConfig.label}
      </div>
    </SelectItem>
  )
}
