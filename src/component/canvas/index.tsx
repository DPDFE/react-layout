import { CanvasProps, LayoutType } from '@/interfaces';
import React from 'react';
import styles from './styles.module.css';
import DragItem from './drag-item';

const Canvas = (props: CanvasProps) => {
    return (
        <div
            className={styles.canvas}
            style={{
                width: props.width * props.scale,
                height: props.height * props.scale,
                overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden'
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
