// TODO 会粘住

import {
    WidgetItemProps,
    LayoutMode,
    LayoutItemEntry,
    LayoutItemDescriptor,
    WidgetType
} from '@/interfaces';
import isEqual from 'lodash.isequal';
import React, {
    memo,
    ReactElement,
    useContext,
    useRef,
    useCallback,
    useMemo,
    useEffect,
    useState,
    useLayoutEffect
} from 'react';

import { calcXYWH, MIN_DRAG_LENGTH } from '../layout/context/calc';
import Draggable from './draggable';
import Resizable from './resizable';
// vite在watch模式下检测style变化需要先将内容引进来才能监听到
import styles from './styles.module.css';
import './styles.module.css';
import { LayoutContext } from '../layout/context';
import { CHANGE_OPERATOR } from '../layout/constants';
import { useScroll } from 'ahooks';

const WidgetItem = (props: WidgetItemProps) => {
    const child = React.Children.only(props.children) as ReactElement;
    const item_ref = useRef<HTMLDivElement>(null);

    const [is_parent_layout, setIsParentLayout] = useState<boolean>();

    // useContext 会引发页面渲染
    const {
        operator_type,
        registry,
        sticky_target_queue,
        start_droppable,
        moving_droppable
    } = useContext(LayoutContext);

    const pos = useScroll(props.canvas_viewport_ref.current);

    // 移动到视窗
    const moveToWindow = (e: MouseEvent) => {
        if (start_droppable.current?.id === moving_droppable.current?.id) {
            item_ref.current?.scrollIntoView({
                block: 'nearest',
                inline: 'nearest'
            });
        }
    };

    // 滚动到顶
    const scrollToTop = (e: MouseEvent) => {
        const viewport = props.canvas_viewport_ref.current;
        if (viewport && e.clientY - viewport.offsetTop < 10) {
            viewport.scrollTo(0, viewport.scrollTop - viewport.scrollTop / 2);
        }
    };

    // 滚动到底
    const scrollToBottom = (e: MouseEvent) => {
        const viewport = props.canvas_viewport_ref.current;
        if (viewport && window.screen.height - e.screenY < 10) {
            if (
                viewport.scrollHeight - 10 >
                viewport.scrollTop + viewport.clientHeight
            ) {
                viewport.scrollTo(
                    0,
                    viewport.scrollTop +
                        (viewport.scrollHeight -
                            viewport.scrollTop -
                            viewport.clientHeight) /
                            2
                );
            }
        }
    };

    const {
        i,
        type,
        is_dragging,
        need_border_draggable_handler,
        layout_id,
        margin_x,
        margin_y,
        padding,
        is_sticky,
        is_resizable,
        is_draggable,
        x,
        y,
        w,
        h,
        col_width,
        row_height,
        calcBound
    } = props;

    const calcItemPosition = () => {
        const out = calcXYWH(
            props,
            col_width,
            row_height,
            margin_x,
            margin_y,
            padding,
            calcBound
        );

        if (is_sticky && pos) {
            // 页面滚动到当前元素位置
            if (pos.top - out.y > 0) {
                // 曾经被添加过后被挤掉的元素不允许重新添加，滚动到过的元素
                const target = sticky_target_queue.current.find(
                    (q) => q.id === i
                );

                if (!target) {
                    const replace_targets: string[] = [];
                    // 判断两条线相交
                    sticky_target_queue.current = sticky_target_queue.current
                        .map((q) => {
                            // 不相交
                            if (q.max_x < x || q.min_x > x + w) {
                                return q;
                            } else {
                                // 相交
                                //当前元素位于sticky元素上方 不操作
                                if (q.y > out.y) {
                                    return q;
                                }
                                // 记录当前元素挤掉的元素，当当前元素还原后，被挤掉元素状态也可被还原
                                if (
                                    !replace_targets.includes(q.id) &&
                                    q.is_sticky
                                ) {
                                    replace_targets.push(q.id);
                                }
                                q.is_sticky = false;
                                return q;
                            }
                        })
                        .concat([
                            // 如果页面的grid发生变化，这里计算的值应该会有问题
                            {
                                id: i,
                                max_x: x + w,
                                min_x: x,
                                y: out.y,
                                is_sticky: true,
                                replace_targets
                            }
                        ]);
                }
            } else {
                // 高度还没有当前元素
                // 还原当前元素状态
                const target = sticky_target_queue.current.find(
                    (q) => q.id == i
                );

                if (target) {
                    sticky_target_queue.current = sticky_target_queue.current
                        .map((q) => {
                            if (target.replace_targets.includes(q.id)) {
                                q.is_sticky = true;
                            }
                            return q;
                        })
                        .filter((q) => q.id !== i);
                }
            }
        }

        // 当前置顶的元素，是否处于置顶状态，如果处于置顶状态高度为滚动高度，否则是自身原来高度
        if (is_sticky_target && pos) {
            out.y = pos.top;
        }

        return out;
    };

    // 可以同时置顶一批元素，当前元素，没有被顶掉
    // 操作过程中不置顶
    const is_sticky_target = sticky_target_queue.current.find(
        (q) => q.id === i && q.is_sticky && operator_type.current === undefined
    );

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const keycode_step = 3;

        switch (e.keyCode) {
            case 37: // ArrowLeft
                return {
                    x: x - keycode_step
                };

            case 38: // ArrowUp
                return {
                    y: y - keycode_step
                };

            case 39: // ArrowRight
                return {
                    x: x + keycode_step
                };

            case 40: // ArrowDown
                return {
                    y: y + keycode_step
                };
        }
        return undefined;
    };

    // 如果child是一个iframe，就是一个黑洞，用遮罩把黑洞填上
    const mask_handler = (
        <div
            key={'mask'}
            className={`layout-item-mask`}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        ></div>
    );

    // 如果child是一个iframe，就是一个黑洞，用遮罩把黑洞填上
    const draggable_handler = (
        <React.Fragment key={'draggable_handler'}>
            <div
                key={'top_draggable_handler'}
                className={`draggable_handler ${styles.draggable_handler}`}
                style={{
                    width: '100%',
                    height: 10,
                    minHeight: 10,
                    top: 0,
                    left: 0
                }}
            ></div>
            <div
                key={'bottom_draggable_handler'}
                className={`draggable_handler ${styles.draggable_handler}`}
                style={{
                    width: '100%',
                    height: 10,
                    minHeight: 10,
                    bottom: 0,
                    left: 0
                }}
            ></div>
        </React.Fragment>
    );

    const getCurrentChildren = useCallback(() => {
        const children = [child.props.children];

        if (props.mode === LayoutMode.edit) {
            // 拖拽过程中让所有元素都可以触发move事件，但是释放了以后还要能选中
            if (
                (operator_type.current &&
                    CHANGE_OPERATOR.includes(operator_type.current) &&
                    is_parent_layout) ||
                props.need_mask
            ) {
                children.push(mask_handler);
            }

            // 让drag_handler放置在最上面
            if (need_border_draggable_handler) {
                children.push(draggable_handler);
            }
        }

        return children;
    }, [
        operator_type,
        child,
        need_border_draggable_handler,
        props.is_checked,
        props.is_placeholder
    ]);

    useLayoutEffect(() => {
        if (props.is_placeholder) return;

        setIsParentLayout(!!getLayoutItemRef()?.querySelector('#react-layout'));
    }, []);

    const setTransition = () => {
        const transition = 'all 0.1s linear';

        if (props.is_placeholder) return transition;

        if (props.is_checked || is_sticky_target) return 'none';

        return transition;
    };

    const out = calcItemPosition();

    const new_child = React.cloneElement(child, {
        key: i,
        tabIndex: i,
        onMouseDown: () => {
            props.setCurrentChecked?.(i);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
            if (type === WidgetType.drag) {
                const keydown_pos = handleKeyDown(e);
                if (keydown_pos) {
                    props.onPositionChange?.(
                        {
                            ...{ x, y, h, w, i, type },
                            ...keydown_pos
                        },
                        e as unknown as MouseEvent
                    );
                }
            }
        },
        ref: item_ref,
        id: `${
            child.props.id
                ? child.props.id + ' layout_item_' + i
                : 'layout_item_' + i
        }`,
        className: `${[
            child.props.className,
            styles.layout_item,
            props.is_checked && !props.is_placeholder
                ? styles['checked-border']
                : ''
        ].join(' ')}`,
        style: {
            border: '1px solid transparent',
            width: out.w,
            height: out.h,
            ...child.props.style,
            cursor:
                props.is_draggable && !props.need_border_draggable_handler
                    ? 'grab'
                    : 'inherit',
            zIndex: is_sticky_target || is_dragging ? 1000 : 'auto',
            transition: setTransition()
        },
        children: getCurrentChildren()
    });

    /**
     * 获取模块最小范围
     */
    const getMinimumBoundary = () => {
        const bound_strategy = {
            [WidgetType.drag]: {
                min_w: props.min_w ?? MIN_DRAG_LENGTH,
                min_h: props.min_h ?? MIN_DRAG_LENGTH
            },
            [WidgetType.grid]: {
                min_w: (props.min_w ?? 1) * col_width,
                min_h: (props.min_h ?? 1) * row_height
            }
        };
        return bound_strategy[type];
    };

    const unique_id = useMemo(() => {
        return `layout_item_${i}`;
    }, []);

    const descriptor: LayoutItemDescriptor = useMemo(
        () => ({
            id: i,
            layout_id,
            pos: {
                i,
                x,
                y,
                w,
                h,
                type,
                is_resizable,
                is_draggable,
                layout_id
            }
        }),
        [i, layout_id, x, y, w, h, type, is_resizable, is_draggable]
    );

    const getLayoutItemRef = useCallback((): HTMLElement | null => {
        if (item_ref instanceof Function) {
            return null;
        }
        return item_ref.current as HTMLElement;
    }, []);

    const entry: LayoutItemEntry = useMemo(
        () => ({
            descriptor,
            unique_id,
            getRef: getLayoutItemRef
        }),
        [descriptor, getLayoutItemRef, unique_id]
    );
    const published_ref = useRef<LayoutItemEntry>(entry);
    const is_first_publish_ref = useRef<boolean>(true);

    useEffect(() => {
        if (props.is_placeholder) return;
        registry.draggable.register(published_ref.current);
        return () => registry.draggable.unregister(published_ref.current);
    }, [registry.draggable]);

    useEffect(() => {
        if (props.is_placeholder) return;
        if (is_first_publish_ref.current) {
            is_first_publish_ref.current = false;
            return;
        }

        const last = published_ref.current;
        published_ref.current = entry;
        registry.draggable.update(entry, last);
    }, [entry, registry.draggable]);

    return (
        <React.Fragment>
            {/** drag 拖拽不限制范围，限制阴影范围控制显示 */}
            <Draggable
                {...out}
                threshold={5}
                use_css_transform
                scale={props.scale}
                is_draggable={is_draggable}
                onDragStart={({ e, x, y }) => {
                    props.onDragStart?.(
                        {
                            x: x,
                            y: y,
                            w: props.w,
                            h: props.h,
                            type,
                            i
                        },
                        e
                    );
                }}
                draggable_handler={
                    need_border_draggable_handler
                        ? '.draggable_handler'
                        : undefined
                }
                draggable_cancel_handler={
                    props.draggable_cancel_handler
                        ? [props.draggable_cancel_handler]
                        : []
                }
                onDrag={({ e, x, y }) => {
                    scrollToBottom(e);
                    scrollToTop(e);
                    moveToWindow(e);

                    props.onDrag?.(
                        {
                            x: x,
                            y: y,
                            w: out.w,
                            h: out.h,
                            type,
                            i
                        },
                        e
                    );
                }}
                onDragStop={({ e, x, y }) => {
                    props.onDragStop?.(
                        {
                            x: x,
                            y: y,
                            w: out.w,
                            h: out.h,
                            type,
                            i
                        },
                        e
                    );
                }}
            >
                <Resizable
                    key={unique_id}
                    style={{
                        // mixBlendMode: 'difference',
                        // filter: 'invert(0)',
                        zIndex: is_sticky_target || is_dragging ? 1000 : 'auto'
                    }}
                    ref={item_ref}
                    {...out}
                    scale={props.scale}
                    use_css_transform
                    is_resizable={is_resizable}
                    onResizeStart={({ e, x, y, h, w }) => {
                        props.onResizeStart?.(
                            {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type,
                                i
                            },
                            e
                        );
                    }}
                    cursors={props.cursors}
                    onResize={({ e, x, y, h, w }) => {
                        scrollToTop(e);
                        scrollToBottom(e);
                        moveToWindow(e);
                        props.onResize?.(
                            {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type,
                                i
                            },
                            e
                        );
                    }}
                    {...getMinimumBoundary()}
                    onResizeStop={({ e, x, y, h, w }) => {
                        props.onResizeStop?.(
                            {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type,
                                i
                            },
                            e
                        );
                    }}
                >
                    {new_child}
                </Resizable>
            </Draggable>
        </React.Fragment>
    );
};

WidgetItem.defaultProps = {
    scale: 1,
    type: WidgetType.grid,
    is_checked: false,
    is_placeholder: false,
    style: {}
};

export default memo(WidgetItem, compareProps);

function compareProps<T>(prev: Readonly<T>, next: Readonly<T>): boolean {
    return !Object.keys(prev)
        .map((key) => {
            if (
                [
                    'data-drag',
                    'setCurrentChecked',
                    'onDragStart',
                    'onDrag',
                    'onDragStop',
                    'onResizeStart',
                    'onResize',
                    'onResizeStop',
                    'onPositionChange',
                    'canvas_viewport_ref'
                ].includes(key)
            ) {
                return true;
            } else {
                //-- !isEqual(prev[key], next[key]) &&
                //     console.log(prev['i'], key, prev[key], next[key]);
                return isEqual(prev[key], next[key]);
            }
        })
        .some((state) => state === false);
}

export function childrenEqual(a: ReactElement, b: ReactElement): boolean {
    return isEqual(
        React.Children.map(a, (c) => c?.key),
        React.Children.map(b, (c) => c?.key)
    );
}
