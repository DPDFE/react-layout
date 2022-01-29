import React, { ReactElement, RefObject } from 'react';

export enum States {
    ready = 'ready',
    progress = 'progress',
    over = 'over'
}

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
    onDrop?: (item: any) => void;
    onDragStart?: () => void;
    onDragStop?: (layout: any) => void;
    onResizeStart?: () => void;
    onResizeStop?: (layout: any) => void;
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

/** 子元素 */
export interface DragItemProps extends DragItem {
    scale: number;
    style: React.CSSProperties;
    className: string;
    children: ReactElement;
}

/** 拖拽 */
export interface DraggableProps {
    scale: number;
    children: ReactElement;
    style: React.CSSProperties;
    position: { x: number; y: number };
    setPosition: ({ x, y }: { x: number; y: number }) => void;
    onMouseUp?: (e: React.MouseEvent<Element, MouseEvent>) => void;
    onMouseDown?: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

/** 缩放 */
export interface ResizableProps extends DragItemProps {}
