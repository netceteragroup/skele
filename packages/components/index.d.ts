import React from 'react'
import { ReactNode } from 'react';

export interface ViewportTrackerProps {
    children: React.ReactNode
}
export class ViewportTracker extends React.Component<ViewportTrackerProps> {}


export interface ViewportAwareComponentProps {
    /**
     * Determines pre-triggering of inViewport. Useful for rendering components beforehand to improve user experience. A ratio of 0.5 means that the effective viewport will be twice the size of the real viewport.
     */
    preTriggerRatio?: number = 0
    /**
     * Invoked when the component enters the viewport.
     */
    onViewportEnter?: () => void
    /**
     * Invoked when the component leaves the viewport.
     */
    onViewportLeave?: () => void
    /**
     * Allows access to the reference of the wrapped component.
     */
    innerRef?: React.Ref
}
export class ViewportAware<P> extends React.Component<ViewportAwareComponentProps & P> {}

export interface ViewportAwarePlaceholderProps {
    /**
     * Placeholder that can override the one provided on construction
     */
    placeholder?: React.Component
    /**
     * Whether to keep the wrapped component displayed once it enters the viewport.
     */
    retainOnceInViewport?: boolean
}
export class ViewportAwarePlaceholder extends React.Component<ViewportAwarePlaceholderProps> {}



export const Viewport = {
    Tracker: ViewportTracker,
    Aware: (component: typeof React.Component) => ViewportAware,
    WithPlaceholder: (image: React.Component, placeholder: React.Component) => ViewportAwarePlaceholder
}
