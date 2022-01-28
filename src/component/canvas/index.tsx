import { CanvasProps, LayoutType } from '@/interfaces';
import React from 'react';
import styles from './styles.module.css';
import DragItem from './drag-item';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    return (
        <div
            className={styles.canvas}
            style={{
                width: props.width * props.scale,
                height: props.height * props.scale,
                top: props.t_offset,
                left: props.l_offset,
                overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden'
            }}
        >
            {props.children.map((child) => {
                return (
                    <DragItem
                        {...props}
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
