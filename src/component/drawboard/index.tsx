import * as React from 'react';
import { ReactDragLayoutProps } from '../../interface';
import styles from './styles.module.css';

interface DrawBoardProps extends ReactDragLayoutProps {}

const DrawBoard = (props: DrawBoardProps) => {
  return (
    <div
      className={styles.draw_board}
      style={{
        width: props.width,
        height: props.height,
        backgroundColor: '#bfadad'
      }}
    >
      <div>aaa</div>
    </div>
  );
};

export default DrawBoard;
