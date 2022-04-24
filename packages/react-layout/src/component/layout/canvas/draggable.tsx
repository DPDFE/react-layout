import { BoundType, DraggableProps } from '@/interfaces';
import {
    addEvent,
    removeEvent,
    matchesSelectorAndParentsTo
} from '@dpdfe/event-utils';
import classNames from 'classnames';
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
    const [mouse_pos, setMousePos] = useState<Pos>({ x: 0, y: 0 }); // 鼠标点击坐标
    const [start_pos, setStartPos] = useState<Pos>({ x: 0, y: 0 });

    /** 获取相对父元素偏移量 */
    const offsetXYFromParent = (e: MouseEvent) => {
        const current = (child.ref as RefObject<HTMLElement>).current;
        const parent = current?.parentElement as HTMLElement;

        const { left, top } = parent?.getBoundingClientRect();

        const x = (e.clientX + parent.scrollLeft - left) / (props.scale ?? 1);
        const y = (e.clientY + parent.scrollTop - top) / (props.scale ?? 1);
        return { x, y };
    };

    /** 开始 偏移量大于5px 判断为开始拖拽 */
    const handleDragStart = (e: MouseEvent) => {
        if (!props.is_draggable) {
            return;
        }

        const current = (child.ref as RefObject<HTMLElement>).current;

        // 有禁止拖拽元素时阻止拖拽效果
        if (e.target && props.draggable_cancel_handler) {
            const is_cancel_match = matchesSelectorAndParentsTo(
                e.target as Node,
                props.draggable_cancel_handler,
                current as Node
            );

            if (is_cancel_match) {
                return;
            }
        }

        if (e.target && props.draggable_handler) {
            const is_draggable_match = matchesSelectorAndParentsTo(
                e.target as Node,
                props.draggable_handler,
                current as Node
            );

            if (!is_draggable_match) {
                return;
            }
        }

        const { x, y } = offsetXYFromParent(e);
        setDragState(DragStates.ready);
        setMousePos({ x, y });
        setStartPos({ x: props.x, y: props.y });
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
            x: clamp(start_pos.x + delta_x, min_x, max_x),
            y: clamp(start_pos.y + delta_y, min_y, max_y)
        };
        if (drag_state === DragStates.dragging) {
            props.onDrag?.(pos);
        }
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
                addEvent(document, 'mousemove', handleDrag, { capture: true });
                addEvent(document, 'mouseup', handleDragStop, {
                    capture: true
                });
                break;
            case DragStates.draged:
                props.onDragStop?.({ x: props.x, y: props.y });
                setDragState(undefined);
                break;
        }
        return () => {
            removeEvent(document, 'mousemove', handleDrag, { capture: true });
            removeEvent(document, 'mouseup', handleDragStop, { capture: true });
        };
    }, [drag_state]);

    const setUserSelect = () => {
        const user_select: 'none' | 'inherit' =
            drag_state === DragStates.dragging ? 'none' : 'inherit';
        return {
            UserSelect: user_select,
            WebkitUserSelect: user_select,
            MozUserSelect: user_select
        };
    };

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation();
            child.props.onMouseDown?.(e);
            handleDragStart(e as unknown as MouseEvent);
        },
        className: classNames(props.className, child.props.className),
        style: {
            ...props.style,
            ...child.props.style, // 让props覆盖上面配置的style
            ...setUserSelect(),
            ...(props.use_css_transform
                ? setTransform(props.x, props.y)
                : setTopLeft(props.x, props.y)),
            position: props.use_css_fixed ? 'fixed' : 'absolute'
        }
    });

    return new_child;
};

Draggable.defaultProps = {
    threshold: 0,
    is_draggable: false,
    use_css_transform: true,
    use_css_fixed: false,
    scale: 1,
    style: {},
    bound: DEFAULT_BOUND
};

export default memo(Draggable);

export const setTransform = (x: number, y: number) => {
    const translate = `translate(${x}px,${y}px)`;
    return {
        transform: translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate
    };
};

export const setTopLeft = (x: number, y: number) => {
    return {
        left: `${x}px`,
        top: `${y}px`
    };
};

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
