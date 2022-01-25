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
