import { DragItemProps } from '@/interfaces';
import React, { memo, useRef, useState } from 'react';
import Draggable from './draggable';
import Resizable from './resizable';
import styles from './styles.module.css';

const LayoutItem = (props: DragItemProps) => {
    const item_ref = useRef<HTMLDivElement>(null);
    const child = React.Children.only(props.children);

    const new_child = React.cloneElement(child, {
        ref: item_ref,
        className: `${child.props.className} ${styles.drag_item}`,
        style: {
            ...child.props.style,
            transform: `translate(${props.x * props.scale}px, ${
                props.y * props.scale
            }px)`,
            width: props.w * props.scale,
            height: props.h * props.scale
        },
        onMouseDown: () => {
            console.log('check');
            props.setCurrentChecked(props.i);
        }
    });
    console.log(props);
    return (
        <Resizable {...props}>
            <Draggable {...props}>{new_child}</Draggable>
        </Resizable>
    );
};

LayoutItem.defaultProps = {
    scale: 1,
    style: {}
};

export default memo(LayoutItem);
