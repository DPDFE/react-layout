import { CanvasProps, LayoutType } from '@/interfaces';
import React from 'react';
import styles from './styles.module.css';
import DragItem from './drag-item';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const event_callbacks = {
        onDrop: (item: any) => {
            props.onDrop?.(item);
        },
        onDragStart: () => {
            props.onDragStart?.();
        },
        onDragStop: (layout: any) => {
            props.onDragStop?.(layout);
        },
        onResizeStart: () => {
            props.onResizeStart?.();
        },
        onResizeStop: (layout: any) => {
            props.onResizeStop?.(layout);
        }
    };

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
                        scale={props.scale}
                        children={child}
                        {...child.props}
                        key={child.props.i}
                        {...event_callbacks}
                    ></DragItem>
                );
            })}
        </div>
    );
};

export default Canvas;
