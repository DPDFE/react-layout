import React from 'react';
import HorizontalRuler from './component/horizontal-ruler';
import VerticalRuler from './component/vertical-ruler';
import DrawBoard from './component/drawboard';
import styles from './styles.module.css';
import { ReactDragLayoutProps } from './interface';

export const ReactDragLayout = (props: ReactDragLayoutProps) => {
  return (
    <div className={styles.container}>
      <HorizontalRuler
        height={props.height}
        scale={props.scale}
      ></HorizontalRuler>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <VerticalRuler width={props.width} scale={props.scale}></VerticalRuler>
        <div style={{ overflow: 'auto', position: 'relative', flex: 1 }}>
          <div
            className={styles.canvas_wrapper}
            style={{ width: props.width, height: props.height }}
          >
            <DrawBoard {...props}></DrawBoard>
          </div>
        </div>
      </div>
    </div>
  );
};
