import { DraggableProps, DragItem } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { DOMElement, RefObject, useEffect, useState } from 'react';

interface Pos {
    x: number;
    y: number;
}

export enum DragStates {
    dragging = 'dragging',
    draged = 'draged'
}

const Draggable = (props: DraggableProps) => {
    const child = React.Children.only(props.children);

    const pos = {
        x: props.x,
        y: props.y
    };

    const [drag_state, setDragState] = useState<DragStates>();
    const [mouse_pos, setMousePos] = useState<Pos>({ x: NaN, y: NaN }); // 鼠标点击坐标
    const [current_pos, setCurrentPosition] = useState<Pos>(pos); //实际动态坐标
    const [start_pos, setStartPosition] = useState<Pos>(pos); // 放置当前坐标

    /** 获取相对父元素偏移量 */
    const offsetXYFromParent = (e: MouseEvent) => {
        const current = (
            (child as DOMElement<DragItem, Element>)
                .ref as RefObject<HTMLElement>
        ).current;
        const parent = current?.parentElement as HTMLElement;

        const { left, top } = parent?.getBoundingClientRect();
        const x = (e.clientX + parent.scrollLeft - left) / props.scale;
        const y = (e.clientY + parent.scrollTop - top) / props.scale;
        return { x, y };
    };

    /** 开始 */
    const handleDragStart = (e: MouseEvent) => {
        if (!props.is_draggable) {
            return;
        }
        props.onDragStart?.();

        setDragState(DragStates.dragging);

        const { x, y } = offsetXYFromParent(e);

        setStartPosition(current_pos);
        setMousePos({ x, y });
    };

    /** 结束 */
    const handleDragStop = () => {
        if (!props.is_draggable) {
            return;
        }
        if (drag_state === DragStates.dragging) {
            setDragState(DragStates.draged);
        }
    };

    /**
     * 拖拽计算逻辑：
     * 新坐标 = 放置当前坐标 + 鼠标偏移量
     */
    const handleDrag = (e: MouseEvent) => {
        const { x, y } = offsetXYFromParent(e);

        const delta_x = x - mouse_pos.x;
        const delta_y = y - mouse_pos.y;

        const pos = {
            x: start_pos.x + delta_x,
            y: start_pos.y + delta_y
        };

        setCurrentPosition(pos);
        props.onDrag?.(pos);
    };

    useEffect(() => {
        if (drag_state === DragStates.dragging) {
            addEvent(window, 'mousemove', handleDrag);
            addEvent(window, 'mouseup', handleDragStop);
        }
        if (drag_state === DragStates.draged) {
            props.onDragStop?.(current_pos);
        }
        return () => {
            removeEvent(window, 'mousemove', handleDrag);
            removeEvent(window, 'mouseup', handleDragStop);
        };
    }, [drag_state]);

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            console.log('dragstart');
            child.props.onMouseDown?.(e);
            handleDragStart(e as unknown as MouseEvent);
        },
        onMouseUp: (e: React.MouseEvent) => {
            child.props.onMouseUp?.(e);
            handleDragStop();
        },
        className: `${props.className ? props.className : ''} ${
            child.props.className ? child.props.className : ''
        }`,
        style: {
            transform: `translate(${current_pos.x * props.scale}px, ${
                current_pos.y * props.scale
            }px)`,
            cursor: props.is_draggable ? 'move' : 'inherit',
            userSelect: drag_state === DragStates.draged ? 'inherit' : 'none',
            ...props.style,
            ...child.props.style
        }
    });

    return new_child;
};

Draggable.defaultProps = {
    is_draggable: false,
    scale: 1,
    style: {}
};

export default Draggable;
