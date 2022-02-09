import React, { ReactChild, ReactElement, RefObject } from 'react';

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

export type RulerPointer = {
    x: number;
    y: number;
    direction: DirectionType;
};

export type CursorPointer = {
    x: number;
    y: number;
    cursor: CursorType;
};

export type ItemPos = {
    x: number;
    y: number;
    h: number;
    w: number;
};

type EditLayoutBase = {
    onDrop?: ({ x, y }: { x: number; y: number }) => DragItem;
    onRemove?: (i: string) => void;
    onDragStart?: () => void;
    onDrag?: (layout: DragItem[]) => void;
    onDragStop?: (layout: DragItem[]) => void;
    onResizeStart?: () => void;
    onResize?: (layout: DragItem[]) => void;
    onResizeStop?: (layout: DragItem[]) => void;
    onPositionChange?: (layout: DragItem[]) => void;
};

type GuideLine = {
    guide_lines?: RulerPointer[];
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    removeGuideLine?: ({ x, y, direction }: RulerPointer) => void;
};

export type DragLayout = {
    scale: number;
    width: number;
    height: number;
    mode: LayoutType.view;
    children: ReactElement[];
};

export type DragEditLayout = EditLayoutBase &
    GuideLine & {
        scale: number;
        width: number;
        height: number;
        mode: LayoutType.edit;
        children: ReactElement[];
    };

export type DragLayoutProps = DragLayout | DragEditLayout;

export type GridLayout = {
    scale: number;
    mode: LayoutType.view;
    cols: number;
    container_margin?: [number, number?, number?, number?];
    children: ReactElement[];
};

export type GridEditLayout = EditLayoutBase &
    GuideLine & {
        scale: number;
        mode: LayoutType.edit;
        cols: number;
        container_margin?: [number, number?, number?, number?];
        children: ReactElement[];
    };

export type GridLayoutProps = GridLayout | GridEditLayout;

export type EditLayoutProps = DragEditLayout | GridEditLayout;

/** 画板props */
export type ReactDragLayoutProps =
    | DragLayout
    | GridLayout
    | DragEditLayout
    | GridEditLayout;

/** 水平标尺props */
export type HorizontalRulerProps = ReactDragLayoutProps & {
    width: number;
    wrapper_width: number;
    l_offset: number;
    setRulerHoverPos: ({ x, y, direction }?: RulerPointer) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    canvas_viewport: RefObject<HTMLDivElement>;
};

/** 垂直标尺props */
export type VerticalRulerProps = ReactDragLayoutProps & {
    height: number;
    wrapper_height: number;
    t_offset: number;
    setRulerHoverPos: ({ x, y, direction }?: RulerPointer) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    canvas_viewport: RefObject<HTMLDivElement>;
};

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
export type CanvasProps = ReactDragLayoutProps & {
    width: number;
    height: number;
    t_offset: number;
    l_offset: number;
    fresh_count: number;
    setFreshCount: (count: number) => void;
    canvas_wrapper: RefObject<HTMLDivElement>;
};

/** 单节点属性 */
export interface DragItem extends ItemPos {
    i: string;
    is_draggable?: boolean;
    is_resizable?: boolean;
    is_float?: boolean;
}

interface EventBaseProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    children: ReactElement;
}

/** 子元素 */
export interface LayoutItemProps extends EventBaseProps {
    width: number;
    height: number;
    scale: number;
    bound?: [number, number?, number?, number?];
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

export interface MenuProps {
    children: ReactElement;
    // target: ReactElement; // 点击目标时目录显示，非目标不显示
}

export interface MenuItemProps {
    children: ReactChild;
}
