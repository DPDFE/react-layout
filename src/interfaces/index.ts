import { RefObject } from 'react';

export enum LayoutType {
  edit = 'edit',
  view = 'view'
}

export interface ReactDragLayoutProps {
  scale: number;
  width: number;
  height: number;
  mode: LayoutType;
}

/** 水平标尺props */
export interface HorizontalRulerProps extends ReactDragLayoutProps {
  wrapper_width: number;
  canvas_viewport: RefObject<HTMLDivElement>;
}

/** 垂直标尺props */
export interface VerticalRulerProps extends ReactDragLayoutProps {
  wrapper_height: number;
  canvas_viewport: RefObject<HTMLDivElement>;
}
