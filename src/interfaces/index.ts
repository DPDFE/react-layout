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

export interface CursorPointer {
    x: number;
    y: number;
    cursor: CursorType;
}

export interface ItemPos {
    x: number;
    y: number;
    h: number;
    w: number;
}

/** 画板props */
export interface ReactDragLayoutProps {
    scale: number;
    width: number;
    height: number;
    mode: LayoutType;
    guide_lines?: RulerPointer[];
    onDrop?: ({ x, y }: { x: number; y: number }) => DragItem;
    onDragStart?: () => void;
    onDrag?: (layout: DragItem[]) => void;
    onDragStop?: (layout: DragItem[]) => void;
    onResizeStart?: () => void;
    onResize?: (layout: DragItem[]) => void;
    onResizeStop?: (layout: DragItem[]) => void;
    onPositionChange?: (layout: DragItem[]) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    removeGuideLine?: ({ x, y, direction }: RulerPointer) => void;
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
    removeGuideLine?: ({ x, y, direction }: RulerPointer) => void;
}

/** 画布props */
export interface CanvasProps extends ReactDragLayoutProps {
    t_offset: number;
    l_offset: number;
    fresh_count: number;
    setFreshCount: (count: number) => void;
    canvas_wrapper: RefObject<HTMLDivElement>;
}

/** 单节点属性 */
export interface DragItem extends ItemPos {
    i: string;
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
    onPositionChange?: (item: DragItem) => void;
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
    onDrag?: ({ x, y, cursor }: CursorPointer) => void;
    onDragStop?: ({ x, y, cursor }: CursorPointer) => void;
}

/** resize */
export interface ResizableProps extends EventBaseProps, ItemPos {
    scale: number;
    is_resizable?: boolean;
    onResizeStart?: () => void;
    onResize?: ({ x, y, h, w }: ItemPos) => void;
    onResizeStop?: ({ x, y, h, w }: ItemPos) => void;
}
