import { DragItemProps } from '@/interfaces';
import React, { memo, useRef } from 'react';
import Draggable from './draggable';
import Resizable from './resizable';
import styles from './styles.module.css';

const DragItem = (props: DragItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const child = React.Children.only(props.children);

    const new_child = React.cloneElement(child, {
        ref: itemRef,
        className: `${child.props.className} ${styles.drag_item}`,
        style: {
            ...child.props.style,
            transform: `translate(${props.x * props.scale}px, ${
                props.y * props.scale
            }px)`,
            width: props.w * props.scale,
            height: props.h * props.scale
        }
    });

    return (
        <Resizable {...props}>
            {props.is_draggable ? (
                <Draggable
                    x={props.x}
                    y={props.y}
                    style={props.style}
                    scale={props.scale}
                >
                    {new_child}
                </Draggable>
            ) : (
                new_child
            )}
        </Resizable>
    );
};

DragItem.defaultProps = {
    isDraggable: false,
    isResizable: false,
    scale: 1,
    style: {}
};

export default memo(DragItem);
