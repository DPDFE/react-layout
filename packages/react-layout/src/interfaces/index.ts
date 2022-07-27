import React, { ReactChild, ReactElement, RefObject } from 'react';

export interface StickyTarget {
    id: string;
    max_x: number;
    min_x: number;
    y: number;
    is_sticky: boolean; // 当前置顶
    replace_targets: string[]; // 关联元素 A => [B,C] 当前元素替换了的元素，当当前元素还原，替换元素也还原
}

export enum OperatorType {
    dropstart = 'dropstart',
    dragstart = 'dragstart',
    drag = 'drag',
    dragover = 'dragover',
    resizestart = 'resizestart',
    resize = 'resize',
    resizeover = 'resizeover',
    drop = 'drop',
    dropover = 'dropover',
    changeover = 'changeover'
}

export enum WidgetType {
    drag = 'drag',
    grid = 'grid'
}

export enum LayoutMode {
    edit = 'edit',
    view = 'view'
}

export enum LayoutType {
    DRAG = 'drag',
    GRID = 'grid'
}

export enum CursorType {
    nw = 'nw-resize',
    ne = 'ne-resize',
    sw = 'sw-resize',
    se = 'se-resize',
    n = 'n-resize',
    e = 'e-resize',
    s = 's-resize',
    w = 'w-resize'
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
    e: MouseEvent;
};

export type GridType = {
    col_width: number;
    row_height: number;
};

export type MarginType = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export type BoundType = {
    max_x: number;
    max_y: number;
    min_x: number;
    min_y: number;
};

export type Pos = {
    x: number;
    y: number;
    h: number;
    w: number;
};

export type ItemPos = Pos & {
    i: string;
    type: WidgetType;
};

type NodeProps = {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
};

type LayoutBase = NodeProps & {
    children: ReactElement[];
    layout_id: string;
    scale: number;
    cols: number;
    row_height: number;
    container_padding: [number, number?, number?, number?];
    item_margin: [number, number];
    need_ruler: boolean;
    need_grid_lines: boolean;
    need_grid_bound: boolean;
    need_drag_bound: boolean;
    is_droppable?: boolean; //不允许放
};

export type DragLayout = LayoutBase & {
    layout_type: LayoutType.DRAG;
    width: number;
    height: number;
    mode: LayoutMode.view;
};

export type DragEditLayout = LayoutBase &
    GuideLine & {
        layout_type: LayoutType.DRAG;
        width: number;
        height: number;
        mode: LayoutMode.edit;
        cursors?: CursorType[];
    };

export type DragLayoutProps = DragLayout | DragEditLayout;

export type GridLayout = LayoutBase & {
    layout_type: LayoutType.GRID;
    mode: LayoutMode.view;
};

export type GridEditLayout = LayoutBase &
    GuideLine & {
        layout_type: LayoutType.GRID;
        mode: LayoutMode.edit;
        cursors?: CursorType[];
    };

export type GridLayoutProps = GridLayout | GridEditLayout;

export type EditLayoutProps = DragEditLayout | GridEditLayout;

/** 画板props */
export type ReactLayoutProps =
    | DragLayout
    | GridLayout
    | DragEditLayout
    | GridEditLayout;

type GuideLine = {
    guide_lines?: RulerPointer[];
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    removeGuideLine?: ({ x, y, direction }: RulerPointer) => void;
};

/** 水平标尺props */
export type HorizontalRulerProps = ReactLayoutProps & {
    width: number;
    wrapper_width: number;
    l_offset: number;
    setRulerHoverPos: (data?: RulerPointer) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    canvas_viewport_ref: RefObject<HTMLDivElement>;
};

/** 垂直标尺props */
export type VerticalRulerProps = ReactLayoutProps & {
    height: number;
    wrapper_height: number;
    t_offset: number;
    setRulerHoverPos: (data?: RulerPointer) => void;
    addGuideLine?: ({ x, y, direction }: RulerPointer) => void;
    canvas_viewport_ref: RefObject<HTMLDivElement>;
};

/** 辅助线 */
export interface GuideLineProps {
    scale: number;
    l_offset: number;
    t_offset: number;
    guide_lines?: RulerPointer[];
    ruler_hover_pos?: RulerPointer;
    canvas_viewport_ref: RefObject<HTMLDivElement>;
    removeGuideLine?: ({ x, y, direction }: RulerPointer) => void;
}

/** 单节点属性 */
export interface LayoutItem extends ItemPos {
    min_w?: number;
    min_h?: number;
    moved?: boolean;
    layout_id: string;
    is_sticky?: boolean;
    is_checked?: boolean;
    is_dragging?: boolean;
    is_dropping?: boolean;
    is_resizing?: boolean;
    need_mask?: boolean;
    is_draggable?: boolean;
    is_resizable?: boolean;
    is_droppable?: boolean; // 可以放入其他元素内部
    need_border_draggable_handler?: boolean;
    draggable_cancel_handler?: string;
}

interface EventBaseProps extends NodeProps {
    children: ReactElement;
}

/** 子元素 */
export interface WidgetItemProps extends EventBaseProps, LayoutItem, GridType {
    cols: number;
    need_mask?: boolean;
    layout_type: LayoutType;
    canvas_viewport_ref: RefObject<HTMLDivElement>;
    shadow_ref: RefObject<HTMLDivElement>;
    cursors?: CursorType[];
    layout_id: string;
    margin_x: number;
    margin_y: number;
    scale: number;
    padding: MarginType;
    mode: LayoutMode.edit | LayoutMode.view;
    is_placeholder: boolean;
    calcBound: (item: LayoutItem) => LayoutItem;
    setCurrentChecked?: (idx: string) => void;
    onDragStart?: (item: ItemPos, e: MouseEvent) => void;
    onDrag?: (item: ItemPos, e: MouseEvent) => void;
    onDragStop?: (item: ItemPos, e: MouseEvent) => void;
    onResizeStart?: (item: ItemPos, e: MouseEvent) => void;
    onResize?: (item: ItemPos, e: MouseEvent) => void;
    onResizeStop?: (item: ItemPos, e: MouseEvent) => void;
    onPositionChange?: (item: ItemPos, e: MouseEvent) => void;
}

/** ? 怎么能直接继承 React.HTMLAttributes<HTMLElement> ？？？ */
/** drag */
export interface DraggableProps extends EventBaseProps {
    onContextMenu?: (e: React.MouseEvent<Element, MouseEvent>) => void;
    threshold?: number;
    x: number;
    y: number;
    scale?: number;
    bound?: Partial<BoundType>;
    is_draggable?: boolean;
    use_css_transform?: boolean;
    draggable_cancel_handler?: string[];
    draggable_handler?: string;
    onDragStart?: ({
        e,
        x,
        y
    }: {
        e: MouseEvent;
        x: number;
        y: number;
    }) => void;
    onDrag?: ({ e, x, y }: { e: MouseEvent; x: number; y: number }) => void;
    onDragStop?: ({ e, x, y }: { e: MouseEvent; x: number; y: number }) => void;
}

export interface CursorProps extends Omit<DraggableProps, 'children'> {
    cursor: CursorType;
    use_css_transform?: boolean;
    onDragStart?: ({ e, x, y, cursor }: CursorPointer) => void;
    onDrag?: ({ e, x, y, cursor }: CursorPointer) => void;
    onDragStop?: ({ e, x, y, cursor }: CursorPointer) => void;
}

/** resize */
export interface ResizableProps extends EventBaseProps {
    onMouseDown?: (e: React.MouseEvent<Element, MouseEvent>) => void;
    x: number;
    y: number;
    h: number;
    w: number;
    scale?: number;
    min_h?: number;
    min_w?: number;
    bound?: BoundType;
    is_resizable?: boolean;
    use_css_transform?: boolean;
    cursors?: CursorType[];
    onResizeStart?: ({
        x,
        y,
        h,
        w,
        e
    }: {
        x: number;
        y: number;
        h: number;
        w: number;
        e: MouseEvent;
    }) => void;
    onResize?: ({
        x,
        y,
        h,
        w,
        e
    }: {
        x: number;
        y: number;
        h: number;
        w: number;
        e: MouseEvent;
    }) => void;
    onResizeStop?: ({
        x,
        y,
        h,
        w,
        e
    }: {
        x: number;
        y: number;
        h: number;
        w: number;
        e: MouseEvent;
    }) => void;
}

export interface MenuProps extends NodeProps {
    children: ReactElement;
    // target: ReactElement; // 点击目标时目录显示，非目标不显示
}

export interface MenuItemProps extends NodeProps {
    children: ReactChild;
    onClick?: (e: React.MouseEvent) => void;
}

export interface LayoutItemDescriptor {
    id: string;
    layout_id: string;
    pos: LayoutItem;
}

export interface LayoutItemEntry {
    unique_id: string;
    descriptor: LayoutItemDescriptor;
    getRef: () => HTMLElement | null;
}

export type WidgetLocation = {
    layout_id: string;
    widgets: LayoutItem[];
};

export type LayoutResult = {
    type: OperatorType;
    widget_id: string;
    source: WidgetLocation;
    widget: LayoutItem;
    destination?: WidgetLocation;
};

export interface ReactLayoutContextProps {
    getDroppingItem?: () => { h: number; w: number; i: string };
    onDrop?: (result: LayoutResult) => void;
    onDragStart?: (result: LayoutResult) => void;
    onDrag?: (result: LayoutResult) => void;
    onDragStop?: (result: LayoutResult) => void;
    onResizeStart?: (result: LayoutResult) => void;
    onResize?: (result: LayoutResult) => void;
    onResizeStop?: (result: LayoutResult) => void;
    onChange?: (result: LayoutResult) => void;
    onPositionChange?: (result: LayoutResult) => void;
}

export interface Droppable {
    saveLayout: (layout: LayoutItem[]) => void;
    id: string;
    is_droppable?: boolean;
    getRef: () => HTMLDivElement | null;
    getViewPortRef: () => HTMLDivElement | null;
    getFilterLayoutById: (i: string) => LayoutItem[];
    cleanShadow: (widget?: LayoutItem) => void;
    addShadow: (
        widget: LayoutItem,
        is_save?: boolean
    ) => {
        source: WidgetLocation;
        widget: LayoutItem;
        destination?: WidgetLocation;
    };
    move: (current_widget: LayoutItem, item_pos: ItemPos) => void;
}
