import { CanvasProps, LayoutType } from '@/interfaces';
import React, { memo, useState } from 'react';
import styles from './styles.module.css';
import LayoutItem from './layout-item';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const [checked_index, setCurrentChecked] = useState<string>();

    const layout_item_config = {
        scale: props.scale,

        checked_index: checked_index,
        setCurrentChecked: setCurrentChecked,

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
                    <LayoutItem
                        key={child.props.i}
                        {...child.props}
                        {...layout_item_config}
                        children={child}
                    ></LayoutItem>
                );
            })}
        </div>
    );
};

export default memo(Canvas);
