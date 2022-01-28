import { DraggableProps, DragItem } from '@/interfaces';
import { addEvent } from '@pearone/event-utils';
import React, { DOMElement, RefObject, useEffect } from 'react';

const Draggable = (props: DraggableProps) => {
    const child = React.Children.only(props.children);

    const events = {
        mouse: {
            start: 'mousedown',
            move: 'mousemove',
            stop: 'mouseup'
        }
    };

    /** 开始 */
    const onMouseStart = () => {
        console.log('mouse start', props);
    };

    const onMouseUp = () => {
        console.log('onMouseUp', props);
    };

    const onMouseDown = () => {
        console.log('onMouseDown', props);
    };

    useEffect(() => {
        const current = (
            (child as DOMElement<DragItem, Element>).ref as RefObject<Element>
        ).current;
        addEvent(current, events.mouse.start, onMouseStart);
    }, []);

    const new_child = React.cloneElement(child, {
        onMouseUp: onMouseUp,
        onMouseDown: onMouseDown
    });

    return new_child;
};

export default Draggable;
