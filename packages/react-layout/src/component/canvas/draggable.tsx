import { BoundType, DraggableProps } from '@/interfaces';
import {
    addEvent,
    removeEvent,
    matchesSelectorAndParentsTo
} from '@dpdfe/event-utils';
import classNames from 'classnames';
import React, {
    DOMElement,
    memo,
    RefObject,
    useEffect,
    useRef,
    useState
} from 'react';

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
    dragging = 'dragging',
    dragged = 'dragged'
}

const Draggable = (props: DraggableProps) => {
    const child = React.Children.only(props.children) as DOMElement<
        React.HTMLAttributes<Element>,
        Element
    >;

    const [drag_state, setDragState] = useState<DragStates>(DragStates.dragged);
    const [mouse_pos, setMousePos] = useState<Pos>({ x: 0, y: 0 }); // 鼠标点击坐标
    const [start_pos, setStartPos] = useState<Pos>({ x: 0, y: 0 });
    const current_pos = useRef<{ e: MouseEvent; x: number; y: number }>();
    const mouse_event_ref = useRef<MouseEvent>();
    const dragging_ref = useRef<DragStates>();

    /** 获取相对父元素偏移量 */
    const offsetXYFromParent = (e: MouseEvent) => {
        const current = (child.ref as RefObject<HTMLElement>).current;
        const parent = current?.parentElement as HTMLElement;

        const { left, top } = parent?.getBoundingClientRect();

        const x = (e.clientX + parent.scrollLeft - left) / (props.scale ?? 1);
        const y = (e.clientY + parent.scrollTop - top) / (props.scale ?? 1);
        return { x, y };
    };

    /**
     * 间距计算
     * @param original
     * @param current
     * @returns
     */
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

    /** 开始 偏移量大于5px 判断为开始拖拽 */
    const handleDragStart = (e: MouseEvent) => {
        if (!props.is_draggable) {
            return;
        }

        const current = (child.ref as RefObject<HTMLElement>).current;

        // 有禁止拖拽元素时阻止拖拽效果
        if (
            e.target &&
            props.draggable_cancel_handler &&
            props.draggable_cancel_handler.length > 0
        ) {
            const is_match_target = props.draggable_cancel_handler
                .map((target) => {
                    const is_cancel_match = matchesSelectorAndParentsTo(
                        e.target as Node,
                        target,
                        current as Node
                    );

                    if (is_cancel_match) {
                        return true;
                    }
                    return false;
                })
                .some((state) => state === true);

            if (is_match_target) {
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

        setMousePos({ x, y });
        setStartPos({ x: props.x, y: props.y });

        setDragState(DragStates.dragging);
    };

    /**
     * 拖拽计算逻辑：
     * 新坐标 = 放置当前坐标 + 鼠标偏移量
     */
    const handleDrag = (e: MouseEvent) => {
        const { x, y } = offsetXYFromParent(e);

        const delta_x = x - mouse_pos.x;
        const delta_y = y - mouse_pos.y;

        const { max_x, max_y, min_x, min_y } = formatBound(props.bound);

        const pos = {
            e,
            x: clamp(start_pos.x + delta_x, min_x, max_x),
            y: clamp(start_pos.y + delta_y, min_y, max_y)
        };

        current_pos.current = pos;

        if (
            drag_state === DragStates.dragging &&
            isSloppyClickThresholdExceeded(mouse_pos, {
                x,
                y
            })
        ) {
            if (dragging_ref.current === DragStates.dragged) {
                dragging_ref.current = DragStates.dragging;
                props.onDragStart?.(pos);
            }
            if (dragging_ref.current == DragStates.dragging) {
                props.onDrag?.(pos);
            }
        }
    };

    /**
     * mouseup
     * @param e
     */
    const mouseup = (e: MouseEvent) => {
        mouse_event_ref.current = e;
        setDragState(DragStates.dragged);
    };

    const click = (e: MouseEvent) => {
        mouseup(e);
    };

    const contextmenu = (e: MouseEvent) => {
        mouseup(e);
    };

    const addDragEvent = () => {
        addEvent(document, 'mousemove', handleDrag, {});
        addEvent(document, 'mouseup', mouseup, {});
    };
    const removeDragEvent = () => {
        if (current_pos.current) {
            props.onDragStop?.(current_pos.current);
        }
        dragging_ref.current = DragStates.dragged;
        current_pos.current = undefined;
        removeEvent(document, 'mousemove', handleDrag, {});
        removeEvent(document, 'mouseup', mouseup, {});
    };

    useEffect(() => {
        addEvent(document, 'click', click, {});
        addEvent(document, 'contextmenu', contextmenu, {});
        if (drag_state === DragStates.dragging) {
            addDragEvent();
        }
        return () => {
            removeEvent(document, 'click', click, {});
            removeEvent(document, 'contextmenu', contextmenu, {});
            removeDragEvent();
        };
    }, [drag_state]);

    /**
     * 设置选择样式
     * @returns
     */
    const setUserSelect = () => {
        const user_select: 'none' | 'inherit' =
            drag_state === DragStates.dragged ? 'inherit' : 'none';
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
            position: 'absolute'
        }
    });

    return new_child;
};

Draggable.defaultProps = {
    threshold: 0,
    is_draggable: false,
    use_css_transform: true,
    scale: 1,
    style: {},
    bound: DEFAULT_BOUND
};

export default memo(Draggable);

export const setTransform = (x: number, y: number) => {
    const translate = `translate(${x}px,${y}px)`;
    return {
        willChange: 'transform',
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
