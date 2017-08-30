'use strict'

export const isInViewport = (
  viewportOffset,
  viewportHeight,
  elementOffset,
  elementHeight,
  preTriggerRatio
) => {
  let inViewport = true
  const preTriggerAreaSize = preTriggerRatio
    ? preTriggerRatio * viewportHeight
    : 0
  const elementEnd = elementOffset + elementHeight
  const viewportEnd = viewportOffset + viewportHeight
  const isViewportOffsetAboveElement = viewportOffset <= elementOffset
  if (isViewportOffsetAboveElement) {
    inViewport = elementOffset - preTriggerAreaSize <= viewportEnd
  } else {
    inViewport = elementEnd + preTriggerAreaSize >= viewportOffset
  }
  return inViewport
}
