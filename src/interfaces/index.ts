import React, { ReactElement, RefObject } from 'react';

export enum LayoutType {
    edit = 'edit',
    view = 'view'
}

export enum CursorType {
    nw = 'nw-resize',
    ne = 'ne-resize',
    sw = 'sw-resize',
    se = 'se-resize'
}

export enum DirectionType {
    horizontal = 'horizontal',
    vertical = 'vertical'
}

export interface RulerPointer {
    x: number;
    y: number;
    direction: DirectionType;
}

/** 画板props */
export interface ReactDragLayoutProps {
    scale: number;
    width: number;
    height: number;
    mode: LayoutType;
    guide_lines?: RulerPointer[];
    onDrop?: ({ x, y }: { x: number; y: number }) => string;
    onDragStart?: () => void;
    onDrag?: (layout: DragItem[]) => void;
    onDragStop?: (layout: DragItem[]) => void;
    onResizeStart?: () => void;
    onResize?: (layout: DragItem[]) => void;
    onResizeStop?: (layout: DragItem[]) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    children: ReactElement[];
}

/** 水平标尺props */
export interface HorizontalRulerProps extends ReactDragLayoutProps {
    wrapper_width: number;
    l_offset: number;
    setRulerHoverPos: ({ x, y, direction }?: RulerPointer) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    canvas_viewport: RefObject<HTMLDivElement>;
}

/** 垂直标尺props */
export interface VerticalRulerProps extends ReactDragLayoutProps {
    wrapper_height: number;
    t_offset: number;
    setRulerHoverPos: ({ x, y, direction }?: RulerPointer) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    canvas_viewport: RefObject<HTMLDivElement>;
}

/** 辅助线 */
export interface GuideLineProps {
    scale: number;
    l_offset: number;
    t_offset: number;
    guide_lines?: RulerPointer[];
    ruler_hover_pos?: RulerPointer;
    canvas_viewport: RefObject<HTMLDivElement>;
}

/** 画布props */
export interface CanvasProps extends ReactDragLayoutProps {
    t_offset: number;
    l_offset: number;
    fresh_count: number;
    setFreshCount: (count: number) => void;
}

/** 单节点属性 */
export interface DragItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    is_draggable?: boolean;
    is_resizable?: boolean;
}

interface EventBaseProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children: ReactElement;
}

/** 子元素 */
export interface LayoutItemProps extends EventBaseProps {
    scale: number;
    ['data-drag']: DragItem;
    checked_index?: string;
    setCurrentChecked: (idx: string) => void;
    onDragStart?: () => void;
    onDrag?: (item: DragItem) => void;
    onDragStop?: (item: DragItem) => void;
    onResizeStart?: () => void;
    onResize?: (item: DragItem) => void;
    onResizeStop?: (item: DragItem) => void;
}

/** drag */
export interface DraggableProps extends Omit<EventBaseProps, 'children'> {
    x: number;
    y: number;
    scale: number;
    is_draggable?: boolean;
    onDragStart?: () => void;
    onDrag?: ({ x, y }: { x: number; y: number }) => void;
    onDragStop?: ({ x, y }: { x: number; y: number }) => void;
    bound?: Partial<{
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
    }>;
}

export interface CursorProps extends DraggableProps {
    cursor: CursorType;
    onDrag?: ({
        x,
        y,
        cursor
    }: {
        x: number;
        y: number;
        cursor: CursorType;
    }) => void;
    onDragStop?: ({
        x,
        y,
        cursor
    }: {
        x: number;
        y: number;
        cursor: CursorType;
    }) => void;
}

/** resize */
export interface ResizableProps extends EventBaseProps {
    x: number;
    y: number;
    h: number;
    w: number;
    scale: number;
    is_resizable?: boolean;
    onResizeStart?: () => void;
    onResize?: ({
        x,
        y,
        h,
        w
    }: {
        x: number;
        y: number;
        h: number;
        w: number;
    }) => void;
    onResizeStop?: ({
        x,
        y,
        h,
        w
    }: {
        x: number;
        y: number;
        h: number;
        w: number;
    }) => void;
}
