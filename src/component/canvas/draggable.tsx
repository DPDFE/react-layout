import { DraggableProps, DragItem } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { DOMElement, memo, RefObject, useEffect, useState } from 'react';

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

    const current = (
        (child as DOMElement<DragItem, Element>).ref as RefObject<HTMLElement>
    ).current;

    /** 获取相对父元素偏移量 */
    const offsetXYFromParent = (e: MouseEvent) => {
        const parent = current?.parentElement as HTMLElement;

        const { left, top } = parent?.getBoundingClientRect();
        const x = (e.clientX + parent.scrollLeft - left) / props.scale;
        const y = (e.clientY + parent.scrollTop - top) / props.scale;
        return { x, y };
    };

    /** 开始 */
    const handleDragStart = (e: MouseEvent) => {
        setDragState(DragStates.dragging);

        const { x, y } = offsetXYFromParent(e);

        setStartPosition(current_pos);
        setMousePos({ x, y });
    };

    /** 结束 */
    const handleDragStop = () => {
        setDragState(DragStates.draged);
        addEvent(window, 'mousemove', handleDrag);
    };

    /**
     * 拖拽计算逻辑：
     * 新坐标 = 放置当前坐标 + 鼠标偏移量
     */
    const handleDrag = (e: MouseEvent) => {
        const { x, y } = offsetXYFromParent(e);

        const delta_x = x - mouse_pos.x;
        const delta_y = y - mouse_pos.y;

        setCurrentPosition({
            x: start_pos.x + delta_x,
            y: start_pos.y + delta_y
        });
    };

    useEffect(() => {
        if (drag_state === DragStates.dragging) {
            addEvent(window, 'mousemove', handleDrag);
            addEvent(window, 'mouseup', handleDragStop);
        }
        return () => {
            removeEvent(window, 'mousemove', handleDrag);
            removeEvent(window, 'mouseup', handleDragStop);
        };
    }, [drag_state]);

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            props.onMouseDown?.(e);
            handleDragStart(e as unknown as MouseEvent);
        },
        onMouseUp: (e: React.MouseEvent) => {
            handleDragStop();
        },

        style: {
            ...props.style,
            ...child.props.style,
            transform: `translate(${current_pos.x * props.scale}px, ${
                current_pos.y * props.scale
            }px)`,
            userSelect: drag_state === DragStates.draged ? 'inherit' : 'none'
        }
    });

    return new_child;
};

Draggable.defaultProps = {
    scale: 1,
    style: {}
};

export default memo(Draggable);
