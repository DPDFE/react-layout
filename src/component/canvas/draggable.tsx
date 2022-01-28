import { DraggableProps, DragItem, States } from '@/interfaces';
import React, { DOMElement, RefObject, useState } from 'react';

const Draggable = (props: DraggableProps) => {
    const child = React.Children.only(props.children);

    const [drag_state, setDragState] = useState<States>(States.over);
    const [history_x, setHistoryX] = useState<number>(0);
    const [history_y, setHistoryY] = useState<number>(0);
    const [style_left, setStyleLeft] = useState<number>(props.x);
    const [style_top, setStyleTop] = useState<number>(props.y);

    const current = (
        (child as DOMElement<DragItem, Element>).ref as RefObject<HTMLElement>
    ).current;

    const handleDragStop = (e: React.MouseEvent) => {
        e.persist();
        if (drag_state !== States.over) {
            setDragState(States.over);
            setStyleLeft(parseInt(current!.style.left));
            setStyleTop(parseInt(current!.style.top));
        }
    };

    const handleDragStart = (e: React.MouseEvent) => {
        e.persist();
        setDragState(States.ready);
        setHistoryX(e.clientX);
        setHistoryY(e.clientY);
    };

    const handleDrag = (e: React.MouseEvent) => {
        e.persist();
        if (drag_state !== States.over) {
            setDragState(States.progress);

            const left = style_left + (e.clientX - history_x) / props.scale;
            const top = style_top + (e.clientY - history_y) / props.scale;

            current!.style.left = left + 'px';
            current!.style.top = top + 'px';
        }
    };

    console.log(child);
    const new_child = React.cloneElement(child, {
        onMouseUp: handleDragStop,
        onMouseDown: (e: React.MouseEvent<Element, MouseEvent>) => {
            props.onMouseDown(e);
            handleDragStart(e);
        },
        onMouseMove: handleDrag,
        onMouseOut: handleDragStop,
        style: {
            ...props.style,
            ...child.props.style
        }
    });

    return new_child;
};

export default Draggable;
