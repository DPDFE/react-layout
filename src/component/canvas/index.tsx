import { CanvasProps } from '@/interfaces';
import React from 'react';
import styles from './styles.module.css';
import DragItem from './drag-item';

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
            {props.children.map((child) => {
                return (
                    <DragItem
                        children={child}
                        {...child.props}
                        key={child.props.i}
                    ></DragItem>
                );
            })}
        </div>
    );
};

export default Canvas;
