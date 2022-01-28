import React, { ReactElement, RefObject } from 'react';

export enum LayoutType {
    edit = 'edit',
    view = 'view'
}

/** 画板props */
export interface ReactDragLayoutProps {
    scale: number;
    width: number;
    height: number;
    mode: LayoutType;
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
    isDraggable?: boolean;
    isResizable?: boolean;
}

/** 子元素 */
export interface DragItemProps extends DragItem {
    scale: number;
    style: React.CSSProperties;
    className: string;
    children: ReactElement;
}

/** 拖拽 */
export interface DraggableProps extends DragItemProps {}

/** 缩放 */
export interface ResizableProps extends DragItemProps {}
