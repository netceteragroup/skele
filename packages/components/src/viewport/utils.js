'use strict'

export const isInViewport = (
  viewportOffset,
  viewportSize,
  elementOffset,
  elementSize,
  preTriggerRatio
) => {
  let inViewport = true
  const preTriggerAreaSize = preTriggerRatio
    ? preTriggerRatio * viewportSize
    : 0
  const elementEnd = elementOffset + elementSize
  const viewportEnd = viewportOffset + viewportSize
  const isViewportOffsetBeforeElement = viewportOffset <= elementOffset
  if (isViewportOffsetBeforeElement) {
    inViewport = elementOffset - preTriggerAreaSize <= viewportEnd
  } else {
    inViewport = elementEnd + preTriggerAreaSize >= viewportOffset
  }
  return inViewport
}
