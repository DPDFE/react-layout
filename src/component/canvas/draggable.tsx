import { DraggableProps, DragItem, States } from '@/interfaces';
import React, { DOMElement, RefObject, useState } from 'react';

const Draggable = (props: DraggableProps) => {
    const child = React.Children.only(props.children);

    const [drag_state, setDragState] = useState<States>(States.over);
    const [last_client_x, setLastClientX] = useState<number>(NaN);
    const [last_client_y, setLastClientY] = useState<number>(NaN);
    const [last_x, setLastX] = useState<number>(NaN); // 相对画布起始点
    const [last_y, setLastY] = useState<number>(NaN); // 相对画布起始点

    const current = (
        (child as DOMElement<DragItem, Element>).ref as RefObject<HTMLElement>
    ).current;

    const handleDragStop = (e: React.MouseEvent) => {
        e.persist();
        props.onMouseUp?.(e);
        if (drag_state !== States.over) {
            setDragState(States.over);
            setLastClientX(NaN);
            setLastClientY(NaN);
            setLastX(NaN);
            setLastY(NaN);
        }
    };

    const handleDragStart = (e: React.MouseEvent) => {
        e.persist();
        props.onMouseDown?.(e);
        setDragState(States.ready);
        setLastClientX(e.clientX);
        setLastClientY(e.clientY);
        setLastX(props.position.x);
        setLastY(props.position.y);
    };

    const handleDrag = (e: React.MouseEvent) => {
        e.persist();
        if (drag_state !== States.over) {
            setDragState(States.progress);

            const left = last_x + (e.clientX - last_client_x) / props.scale;
            const top = last_y + (e.clientY - last_client_y) / props.scale;
            console.log(left + ' ' + top);
            props.setPosition({ x: left, y: top });
        }
    };

    const new_child = React.cloneElement(child, {
        onMouseUp: handleDragStop,
        onMouseDown: handleDragStart,
        onMouseMove: handleDrag,
        style: {
            ...props.style,
            ...child.props.style
        }
    });

    return new_child;
};

export default Draggable;
