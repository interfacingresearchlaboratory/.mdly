const VERTICAL_GAP = 10
const HORIZONTAL_OFFSET = 5
const VIEWPORT_MARGIN = 8

export function setFloatingElemPosition(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  isLink: boolean = false,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET
): void {
  const scrollerElem = anchorElem.parentElement

  if (targetRect === null || !scrollerElem) {
    floatingElem.style.opacity = "0"
    floatingElem.style.transform = "translate(-10000px, -10000px)"
    return
  }

  const floatingElemRect = floatingElem.getBoundingClientRect()
  const anchorElementRect = anchorElem.getBoundingClientRect()
  const editorScrollerRect = scrollerElem.getBoundingClientRect()

  let top = targetRect.top - floatingElemRect.height - verticalGap
  let left = targetRect.left - horizontalOffset

  if (top < editorScrollerRect.top) {
    // adjusted height for link element if the element is at top
    top +=
      floatingElemRect.height +
      targetRect.height +
      verticalGap * (isLink ? 9 : 2)
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset
  }

  // Clamp to viewport so the toolbar is not cut off by the page
  const viewportLeft = VIEWPORT_MARGIN
  const viewportRight = window.innerWidth - VIEWPORT_MARGIN
  const viewportTop = VIEWPORT_MARGIN
  const viewportBottom = window.innerHeight - VIEWPORT_MARGIN
  left = Math.max(viewportLeft, Math.min(left, viewportRight - floatingElemRect.width))
  top = Math.max(viewportTop, Math.min(top, viewportBottom - floatingElemRect.height))

  top -= anchorElementRect.top
  left -= anchorElementRect.left

  floatingElem.style.opacity = "1"
  floatingElem.style.transform = `translate(${left}px, ${top}px)`
}
