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

    const [drag_state, setDragState] = useState<DragStates>();
    const [mouse_pos, setMousePos] = useState<Pos>({ x: 0, y: 0 }); // 鼠标点击坐标
    const [start_pos, setStartPos] = useState<Pos>({ x: 0, y: 0 });
    const mouse_event_ref = useRef<MouseEvent>();
    const is_dragging = useRef<Boolean>(false);

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
        removeEvent(document, 'mousemove', handleDrag, { capture: true });

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

        if (
            drag_state === DragStates.dragging &&
            isSloppyClickThresholdExceeded(mouse_pos, {
                x,
                y
            })
        ) {
            if (!is_dragging.current) {
                is_dragging.current = true;
                props.onDragStart?.(e);
            } else {
                props.onDrag?.(pos);
            }
        }
    };

    /** 结束 */
    const handleDragStop = (e: MouseEvent) => {
        is_dragging.current = false;
        removeDragEvent();
        props.onDragStop?.({
            e,
            x: props.x,
            y: props.y
        });

        setDragState(undefined);
    };

    /**
     * mouseup
     * @param e
     */
    const mouseup = (e: MouseEvent) => {
        mouse_event_ref.current = e;
        setDragState(DragStates.dragged);
    };

    const addDragEvent = () => {
        addEvent(document, 'mousemove', handleDrag, { capture: true });
        addEvent(document, 'mouseup', mouseup, {
            capture: true
        });
    };
    const removeDragEvent = () => {
        removeEvent(document, 'mousemove', handleDrag, { capture: true });
        removeEvent(document, 'mouseup', mouseup, {
            capture: true
        });
    };

    useEffect(() => {
        switch (drag_state) {
            case DragStates.dragging:
                addDragEvent();
                break;
            case DragStates.dragged:
                handleDragStop(mouse_event_ref.current!);
                break;
        }
        return removeDragEvent;
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
        // 右键菜单的时候不触发mouseup,这里处理一下
        onContextMenu: (e) => {
            handleDragStop(e as unknown as MouseEvent);
            child.props.onContextMenu?.(e);
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
