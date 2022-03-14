import { BoundType, DraggableProps } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { DOMElement, memo, RefObject, useEffect, useState } from 'react';

export const DEFAULT_BOUND = {
    min_y: -Infinity,
    max_y: Infinity,
    min_x: -Infinity,
    max_x: Infinity
};
interface Pos {
    x: number;
    y: number;
}

export enum DragStates {
    ready = 'ready',
    dragging = 'dragging',
    draged = 'draged'
}

const Draggable = (props: DraggableProps) => {
    const child = React.Children.only(props.children) as DOMElement<
        React.HTMLAttributes<Element>,
        Element
    >;

    const [drag_state, setDragState] = useState<DragStates>();
    const [mouse_pos, setMousePos] = useState<Pos>({ x: props.x, y: props.y }); // 鼠标点击坐标

    /** 获取相对父元素偏移量 */
    const offsetXYFromParent = (e: MouseEvent) => {
        const current = (child.ref as RefObject<HTMLElement>).current;
        const parent = current?.parentElement as HTMLElement;

        const { left, top } = parent?.getBoundingClientRect();

        const x = (e.clientX + parent.scrollLeft - left) / props.scale;
        const y = (e.clientY + parent.scrollTop - top) / props.scale;
        return { x, y };
    };

    /** 开始 偏移量大于5px 判断为开始拖拽 */
    const handleDragStart = (e: MouseEvent) => {
        if (!props.is_draggable) {
            return;
        }

        const { x, y } = offsetXYFromParent(e);
        setDragState(DragStates.ready);
        setMousePos({ x, y });
    };

    function isSloppyClickThresholdExceeded(
        original: Pos,
        current: Pos
    ): boolean {
        const threshold = props.threshold ?? 0;
        return (
            Math.abs(current.x - original.x) >= threshold ||
            Math.abs(current.y - original.y) >= threshold
        );
    }

    /**
     * 拖拽计算逻辑：
     * 新坐标 = 放置当前坐标 + 鼠标偏移量
     */
    const handleDrag = (e: MouseEvent) => {
        const { x, y } = offsetXYFromParent(e);

        if (
            drag_state === DragStates.ready &&
            isSloppyClickThresholdExceeded(mouse_pos, {
                x,
                y
            })
        ) {
            props.onDragStart?.();
            setDragState(DragStates.dragging);
        }

        const delta_x = x - mouse_pos.x;
        const delta_y = y - mouse_pos.y;

        const { max_x, max_y, min_x, min_y } = formatBound(props.bound);

        const pos = {
            x: clamp(props.x + delta_x, min_x, max_x),
            y: clamp(props.y + delta_y, min_y, max_y)
        };
        if (drag_state === DragStates.dragging) props.onDrag?.(pos);
    };

    /** 结束 */
    const handleDragStop = () => {
        if (!props.is_draggable) {
            return;
        }

        setDragState(
            drag_state === DragStates.dragging ? DragStates.draged : undefined
        );
    };

    useEffect(() => {
        switch (drag_state) {
            case DragStates.ready:
            case DragStates.dragging:
                addEvent(document, 'mousemove', handleDrag);
                addEvent(document, 'mouseup', handleDragStop);
                break;
            case DragStates.draged:
                props.onDragStop?.({ x: props.x, y: props.y });
                setDragState(undefined);
                break;
        }
        return () => {
            removeEvent(document, 'mousemove', handleDrag);
            removeEvent(document, 'mouseup', handleDragStop);
        };
    }, [drag_state]);

    const setTransform = () => {
        const translate = `translate(${props.x}px,${props.y}px)`;
        return {
            transform: translate,
            WebkitTransform: translate,
            MozTransform: translate,
            msTransform: translate,
            OTransform: translate
        };
    };

    const setTopLeft = () => {
        return {
            left: `${props.x}px`,
            top: `${props.y}px`
        };
    };

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation();
            child.props.onMouseDown?.(e);
            handleDragStart(e as unknown as MouseEvent);
        },
        className: `${props.className ? props.className : ''} ${
            child.props.className ? child.props.className : ''
        }`,
        style: {
            ...(props.use_css_transform ? setTopLeft() : setTransform()),
            cursor: props.is_draggable ? 'grab' : 'inherit',
            userSelect: drag_state === DragStates.draged ? 'inherit' : 'none',
            position: drag_state === DragStates.dragging ? 'fixed' : 'absolute',
            willChange:
                drag_state === DragStates.dragging ? 'transform' : 'auto',
            ...props.style,
            ...child.props.style // 让props覆盖上面配置的style
        }
    });

    return new_child;
};

Draggable.defaultProps = {
    threshold: 0,
    is_draggable: false,
    scale: 1,
    style: {},
    bound: DEFAULT_BOUND
};

export default memo(Draggable);

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function formatBound(bound?: Partial<BoundType>): BoundType {
    if (bound) {
        return {
            max_x: bound.max_x == undefined ? Infinity : bound.max_x,
            min_x: bound.min_x == undefined ? -Infinity : bound.min_x,
            max_y: bound.max_y == undefined ? Infinity : bound.max_y,
            min_y: bound.min_y == undefined ? -Infinity : bound.min_y
        };
    }
    return DEFAULT_BOUND;
}
