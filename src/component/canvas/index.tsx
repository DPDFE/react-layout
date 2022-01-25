import * as React from 'react';
import { ReactDragLayoutProps } from '../../interfaces';
import styles from './styles.module.css';

interface CanvasProps extends ReactDragLayoutProps {}

const Canvas = (props: CanvasProps) => {
  return (
    <div
      className={styles.draw_board}
      style={{
        width: props.width * props.scale,
        height: props.height * props.scale,
        backgroundColor: '#bfadad'
      }}
    >
      <div>aaa</div>
    </div>
  );
};

export default Canvas;
