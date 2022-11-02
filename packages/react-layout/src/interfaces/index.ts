import React, { ReactChild, ReactElement, RefObject } from 'react';

// sticky
export interface StickyTarget {
    id: string;
    y: number;
    max_x: number;
    min_x: number;
    is_sticky: boolean; // 当前置顶
    replace_targets: string[]; // 关联元素 A => [B,C] 当前元素替换了的元素，当当前元素还原，替换元素也还原
}

// operator
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

// 画布模式
export enum LayoutMode {
    edit = 'edit',
    view = 'view'
}

// 组件容器类型
export enum WidgetType {
    drag = 'drag',
    grid = 'grid'
}

// 画布类型
export enum LayoutType {
    DRAG = 'drag',
    GRID = 'grid'
}

// cursor
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

//
export type CursorPointer = {
    x: number;
    y: number;
    e: MouseEvent;
    cursor: CursorType;
};

// 方向
export enum DirectionType {
    horizontal = 'horizontal',
    vertical = 'vertical'
}

//
export type RulerPointer = {
    x: number;
    y: number;
    direction: DirectionType;
};

// grid
export type GridScheme = {
    col_width: number;
    row_height: number;
};

// margin
export type MarginScheme = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

// bound
export type BoundScheme = {
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
    inner_h: number;
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

// 基础配置
type LayoutBase = NodeProps & {
    cols: number; // 一行几列
    scale: number; // 缩放
    layout_id: string; // ID
    row_height: number; // 行高
    need_ruler: boolean; // 需要标尺
    is_droppable?: boolean; // 画布上允许放置
    need_grid_lines: boolean; // 需要标线
    need_grid_bound: boolean; // 需要grid边界
    need_drag_bound: boolean; // 需要drag边界
    item_margin: [number, number]; // 元素margin
    widgets: LayoutItem[]; // 元素列表
    children: ReactElement[]; // 子元素
    container_padding: [number, number?, number?, number?]; // 画布padding
};

// drag view
export type DragLayout = LayoutBase & {
    layout_type: LayoutType.DRAG;
    width: number;
    height: number;
    mode: LayoutMode.view;
};

// drag edit
export type DragEditLayout = LayoutBase &
    GuideLine & {
        layout_type: LayoutType.DRAG;
        width: number;
        height: number;
        mode: LayoutMode.edit;
        cursors?: CursorType[];
    };

// drag
export type DragLayoutProps = DragLayout | DragEditLayout;

// grid view
export type GridLayout = LayoutBase & {
    layout_type: LayoutType.GRID;
    mode: LayoutMode.view;
};

// grid edit
export type GridEditLayout = LayoutBase &
    GuideLine & {
        layout_type: LayoutType.GRID;
        mode: LayoutMode.edit;
        cursors?: CursorType[];
    };

// grid
export type GridLayoutProps = GridLayout | GridEditLayout;

// edit
export type EditLayoutProps = DragEditLayout | GridEditLayout;

/** 画板props */
export type ReactLayoutProps =
    | DragLayout
    | GridLayout
    | DragEditLayout
    | GridEditLayout;

// guide line
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

// 容器基础配置
export interface CompactItem extends ItemPos {
    min_w?: number; //最小宽度
    min_h?: number; // 最小高度
    is_flex?: boolean; // 垂直方向flex
    is_sticky?: boolean; // 置顶
    is_checked?: boolean; // 被选中
    is_dragging?: boolean; // 正在拖拽
    is_dropping?: boolean; // 正在放置
    is_resizing?: boolean; // 正在缩放
    is_draggable?: boolean; // 可拖拽
    is_resizable?: boolean; // 可缩放
    is_droppable?: boolean; // 可放到其他画布中
    need_border_draggable_handler?: boolean; // 需要拖拽bar
    draggable_cancel_handler?: string; // 禁止拖拽class
}

/** 单节点属性 */
export interface LayoutItem extends CompactItem {
    pxed?: boolean; // 像素化处理状态
    moved?: boolean; // 被标记
    inner_h: number; // 内部高度
    layout_id: string; // 父布局ID
}

interface EventBaseProps extends NodeProps {
    children: ReactElement;
}

/** 子元素 */
export interface WidgetItemProps
    extends EventBaseProps,
        LayoutItem,
        GridScheme {
    cols: number;
    layout_type: LayoutType;
    canvas_viewport_ref: RefObject<HTMLDivElement>;
    shadow_ref: RefObject<HTMLDivElement>;
    cursors?: CursorType[];
    layout_id: string;
    scale: number;
    padding: MarginScheme;
    margin_y: number;
    margin_x: number;
    mode: LayoutMode.edit | LayoutMode.view;
    is_placeholder: boolean;
    is_window_resize: number;
    toXWpx: (item: LayoutItem) => Pos;
    setCurrentChecked?: (idx: string) => void;
    onDragStart?: (item: ItemPos, e: MouseEvent) => void;
    onDrag?: (item: ItemPos, e: MouseEvent) => void;
    onDragStop?: (item: ItemPos, e: MouseEvent) => void;
    onResizeStart?: (item: ItemPos, e: MouseEvent) => void;
    onResize?: (item: ItemPos, e: MouseEvent) => void;
    onResizeStop?: (item: ItemPos, e: MouseEvent) => void;
    onPositionChange?: (item: ItemPos, e: MouseEvent) => void;
    changeWidgetHeight?: (pos: Pos) => void;
}

/** ? 怎么能直接继承 React.HTMLAttributes<HTMLElement> ？？？ */
/** drag */
export interface DraggableProps extends EventBaseProps {
    threshold?: number;
    x: number;
    y: number;
    scale?: number;
    bound?: Partial<BoundScheme>;
    is_draggable?: boolean;
    use_css_transform?: boolean;
    draggable_cancel_handler?: string[];
    draggable_handler?: string;
    onContextMenu?: (e: React.MouseEvent<Element, MouseEvent>) => void;
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
export interface ResizableProps extends EventBaseProps, Omit<Pos, 'inner_h'> {
    min_h?: number;
    min_w?: number;
    scale?: number;
    bound?: BoundScheme;
    is_resizable?: boolean;
    use_css_transform?: boolean;
    cursors?: CursorType[];
    onMouseDown?: (e: React.MouseEvent<Element, MouseEvent>) => void;
    onResizeStart?: (data: Omit<Pos, 'inner_h'> & { e: MouseEvent }) => void;
    onResize?: (data: Omit<Pos, 'inner_h'> & { e: MouseEvent }) => void;
    onResizeStop?: (
        data: Omit<Pos, 'inner_h'> & {
            e: MouseEvent;
        }
    ) => void;
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
    onLayoutHeightChange?: (layout_id: string, height: number) => void;
    onLayoutEntry?: (layout_id: string, entry: Droppable) => void;
}

export interface Droppable {
    saveLayout: (layout: LayoutItem[]) => void;
    id: string;
    is_droppable?: boolean;
    getRef: () => HTMLDivElement | null;
    getViewPortRef: () => HTMLDivElement | null;
    getCanvasWrapperRef: () => HTMLDivElement | null;
    // is_px 会跨越闭包取到当前计算layout上的props参数，
    // 所以要将转化px逻辑封装在register里
    getFilterLayoutById: (i: string, is_px?: boolean) => LayoutItem[];
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
