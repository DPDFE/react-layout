import { DragItemProps } from '@/interfaces';
import React, { useRef } from 'react';
// import { DraggableCore as Draggable } from 'react-draggable';
// import { Resizable } from 'react-resizable';
import clsx from 'clsx';
// import 'react-resizable/css/styles.css';
import styles from './styles.module.css';

const DragItem = (props: DragItemProps) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const child = React.Children.only(props.children);

    const createStyle = () => {
        return {
            width: props.w,
            height: props.h,
            top: props.y,
            left: props.x
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
        // <Draggable>
        //     <Resizable height={props.h} width={props.w}>
        <div style={{ display: 'block' }}>{new_child}</div>
        //     </Resizable>
        // </Draggable>
    );
};

DragItem.defaultProps = {
    isDraggable: false,
    isResizable: false
};

export default DragItem;
