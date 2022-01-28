import { DragItemProps } from '@/interfaces';
import React, { useRef } from 'react';
import Draggable from './draggable';
import Resizable from './resizable';
import clsx from 'clsx';
import styles from './styles.module.css';

const DragItem = (props: DragItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const child = React.Children.only(props.children);

    const createStyle = () => {
        return {
            width: props.w * props.scale,
            height: props.h * props.scale,
            top: props.y * props.scale,
            left: props.x * props.scale
        };
    };

    const new_child = React.cloneElement(child, {
        ref: itemRef,
        className: clsx(
            child.props.className,
            props.className,
            styles.drag_item
        ),
        style: { ...props.style, ...child.props.style, ...createStyle() }
    });

    return (
        <React.Fragment>
            {new_child ? (
                <Resizable {...props}>
                    <Draggable {...props}>{new_child}</Draggable>
                </Resizable>
            ) : (
                <div></div>
            )}
        </React.Fragment>
    );
};

DragItem.defaultProps = {
    isDraggable: false,
    isResizable: false
};

export default DragItem;
