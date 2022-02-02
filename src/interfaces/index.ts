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

/** 画板props */
export interface ReactDragLayoutProps {
    scale: number;
    width: number;
    height: number;
    mode: LayoutType;
    onDrop?: (item: any) => void;
    onDragStart?: () => void;
    onDrag?: () => void;
    onDragStop?: () => void;
    onResizeStart?: () => void;
    onResizeStop?: () => void;
    children: ReactElement[];
}

/** 水平标尺props */
export interface HorizontalRulerProps extends ReactDragLayoutProps {
    wrapper_width: number;
    l_offset: number;
    canvas_viewport: RefObject<HTMLDivElement>;
}

/** 垂直标尺props */
export interface VerticalRulerProps extends ReactDragLayoutProps {
    wrapper_height: number;
    t_offset: number;
    canvas_viewport: RefObject<HTMLDivElement>;
}

/** 画布props */
export interface CanvasProps extends ReactDragLayoutProps {
    t_offset: number;
    l_offset: number;
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
    onDrag?: () => void;
    onDragStart?: () => void;
    onDragStop?: () => void;
    onResizeStart?: () => void;
    onResize?: () => void;
    onResizeStop?: () => void;
}

/** drag */
export interface DraggableProps extends EventBaseProps {
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

export interface CursorProps extends Omit<DraggableProps, 'children'> {
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
    onResizeStop?: () => void;
}
