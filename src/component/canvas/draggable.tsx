import { DraggableProps } from '@/interfaces';
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

interface Props extends DraggableProps {
    children: any;
}

const Draggable = (props: Props) => {
    const child = React.Children.only(props.children) as DOMElement<
        Props['children'],
        Element
    >;

    const pos = {
        x: props.x,
        y: props.y
    };

    const [drag_state, setDragState] = useState<DragStates>();
    const [mouse_pos, setMousePos] = useState<Pos>({ x: NaN, y: NaN }); // 鼠标点击坐标
    const [start_pos, setStartPosition] = useState<Pos>(pos); // 放置当前坐标

    /** 获取相对父元素偏移量 */
    const offsetXYFromParent = (e: MouseEvent) => {
        const current = (child.ref as RefObject<HTMLElement>).current;
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

        setStartPosition({ x: props.x, y: props.y });
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

        if (props.bound) {
            const { min_x, max_x, min_y, max_y } = props.bound;
            if (
                (min_x && pos.x < min_x) ||
                (max_x && pos.x > max_x) ||
                (min_y && pos.y < min_y) ||
                (max_y && pos.y > max_y)
            ) {
                return;
            }
        }
        props.onDrag?.(pos);
    };

    useEffect(() => {
        if (drag_state === DragStates.dragging) {
            addEvent(window, 'mousemove', handleDrag);
            addEvent(window, 'mouseup', handleDragStop);
        }
        if (drag_state === DragStates.draged) {
            props.onDragStop?.({ x: props.x, y: props.y });
        }
        return () => {
            removeEvent(window, 'mousemove', handleDrag);
            removeEvent(window, 'mouseup', handleDragStop);
        };
    }, [drag_state]);

    /**
     * react的事件机制是由react重写的绑定在document上完成的，和原生事件为两套响应机制
     * 所以在react内部调用stopPropagation阻止冒泡的时候，只能阻止到document自己或者以上的事件
     * 为了阻止其他非document元素上的冒泡事件，在此处使用原生处理
     */
    const CurrentMouseUp = (e: MouseEvent) => {
        child.props.onMouseUp?.(e);
        handleDragStop();
        e.stopPropagation();
    };

    useEffect(() => {
        const current = (child.ref as RefObject<HTMLElement>).current;
        addEvent(current, 'mouseup', CurrentMouseUp);
        return () => {
            const current = (child.ref as RefObject<HTMLElement>).current;
            removeEvent(current, 'mouseup', CurrentMouseUp);
        };
    }, [child]);

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            child.props.onMouseDown?.(e);
            handleDragStart(e as unknown as MouseEvent);
        },
        className: `${props.className ? props.className : ''} ${
            child.props.className ? child.props.className : ''
        }`,
        style: {
            transform: `translate(${props.x * props.scale}px, ${
                props.y * props.scale
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
