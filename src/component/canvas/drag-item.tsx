import { DragItemProps } from '@/interfaces';
import React, { useRef, useState } from 'react';
import Draggable from './draggable';
import Resizable from './resizable';
import styles from './styles.module.css';

const DragItem = (props: DragItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const child = React.Children.only(props.children);
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: props.x,
        y: props.y
    });

    const new_child = React.cloneElement(child, {
        ref: itemRef,
        className: `${child.props.className} ${styles.drag_item}`,
        style: {
            ...child.props.style,
            transform: `translate(${position.x * props.scale}px, ${
                position.y * props.scale
            }px)`,
            width: props.w * props.scale,
            height: props.h * props.scale
        }
    });

    return (
        <Resizable {...props}>
            {props.is_draggable ? (
                <Draggable
                    style={props.style}
                    scale={props.scale}
                    position={position}
                    setPosition={setPosition}
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
    isResizable: false
};

export default DragItem;
