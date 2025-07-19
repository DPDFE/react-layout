import {
    WidgetItemProps,
    LayoutMode,
    LayoutItemEntry,
    LayoutItemDescriptor,
    WidgetType,
    StickyTarget,
    CursorType,
    OperatorType
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
    useState
} from 'react';

import Draggable from './draggable';
import Resizable from './resizable';
// vite在watch模式下检测style变化需要先将内容引进来才能监听到
import styles from './styles.module.css';
import './styles.module.css';
import { LayoutContext } from '../layout/context';
import { CHANGE_OPERATOR } from '../layout/constants';
import { getDragMinBound } from './constants';
import { resizeObserver } from '../layout/provider/resize-observer';

const SCROLL_WAITING_TIME = 10000;

const WidgetItem = ({
    scale = 1,
    type: widgetType = WidgetType.grid,
    is_checked = false,
    is_placeholder = false,
    style = {},
    ...restProps
}: WidgetItemProps) => {
    // 重构props对象以保持向后兼容
    const props = {
        scale,
        type: widgetType,
        is_checked,
        is_placeholder,
        style,
        ...restProps
    };
    const child = React.Children.only(props.children) as ReactElement;
    const item_ref = useRef<HTMLDivElement>(null);

    // 高度变化
    const [is_init, setInit] = useState<boolean>(false);
    const [is_init_resize, setInitResize] = useState<boolean>(false);
    const [is_item_resize, setItemResize] = useState<number>(Math.random());

    // 滚动状态
    const [is_scrolling, setIsScrolling] = useState<boolean>(false);

    // useContext 会引发页面渲染
    const {
        operator_type,
        registry,
        sticky_target_queue,
        start_droppable,
        moving_droppable,
        checked_index,
        setCurrentChecked
    } = useContext(LayoutContext);

    // 滚动到顶
    const scrollToTop = (e: MouseEvent) => {
        if (props.not_use_edge_scroll) {
            return;
        }
        const viewport = props.canvas_viewport_ref.current;

        if (viewport && e.clientY < 100 && viewport.scrollTop > 10) {
            setIsScrolling(true);
            viewport.scrollTo(
                0,
                viewport.scrollTop - viewport.offsetHeight / 2
            );
            setTimeout(() => {
                setIsScrolling(false);
            }, SCROLL_WAITING_TIME);
        }
    };

    // 滚动到底
    const scrollToBottom = (e: MouseEvent) => {
        if (props.not_use_edge_scroll) {
            return;
        }
        const viewport = props.canvas_viewport_ref.current;

        if (
            viewport &&
            e.clientY - viewport.offsetHeight < 50 &&
            e.clientY > viewport.offsetHeight &&
            viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight >
            0
        ) {
            setIsScrolling(true);
            /** 处理为匀速滚动 */
            viewport.scrollTo(
                0,
                viewport.scrollTop + viewport.offsetHeight / 2
            );
            setTimeout(() => {
                setIsScrolling(false);
            }, SCROLL_WAITING_TIME);
        }
    };

    const {
        i,
        type,
        is_dragging,
        need_border_draggable_handler,
        layout_id,
        is_sticky,
        is_resizable,
        is_draggable,
        x,
        y,
        w,
        h,
        inner_h,
        col_width,
        row_height,
        is_flex,
        toXWpx
    } = props;

    // 拖拽目标
    let is_sticky_target: StickyTarget | undefined = undefined;

    const calcItemPosition = () => {
        const out = toXWpx(props);

        if (is_sticky && props.pos) {
            // 页面滚动到当前元素位置
            if (props.pos.top - out.y > 0) {
                // 曾经被添加过后被挤掉的元素不允许重新添加，滚动到过的元素
                const target = sticky_target_queue.current.find(
                    (q) => q.id === i
                );

                if (!target) {
                    const replace_targets: string[] = [];
                    // 优化相交判断逻辑，减少计算复杂度
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
                            // 所以使用百分比值，不用像素值
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

        // 可以同时置顶一批元素，当前元素，没有被顶掉
        // 操作过程中不置顶
        is_sticky_target = sticky_target_queue.current.find(
            (q) =>
                q.id === i && is_sticky && operator_type.current === undefined
        );

        // 使用transform实现sticky，不需要修改out.y，在style中通过transform处理偏移

        return out;
    };

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const keycode_step = 3;

        switch (e.keyCode) {
            case 37: // ArrowLeft
                return {
                    x: out.x - keycode_step
                };

            case 38: // ArrowUp
                return {
                    y: out.y - keycode_step
                };

            case 39: // ArrowRight
                return {
                    x: out.x + keycode_step
                };

            case 40: // ArrowDown
                return {
                    y: out.y + keycode_step
                };
        }
        return undefined;
    };

    // 如果child是一个iframe，就是一个黑洞，用遮罩把黑洞填上
    const mask_handler = (
        <div
            key={'mask'}
            className={`draggable_handler ${styles.draggable_handler} layout-item-mask`}
            style={{
                width: '100%',
                height: '100%',
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
                className={`draggable_handler ${styles.draggable_handler} layout-item-mask`}
                style={{
                    width: '100%',
                    height: 10,
                    minHeight: 10,
                    top: 0,
                    left: 0
                }}
            ></div>
            {/* <div
                key={'bottom_draggable_handler'}
                className={`draggable_handler ${styles.draggable_handler}`}
                style={{
                    width: '100%',
                    height: 10,
                    minHeight: 10,
                    bottom: 0,
                    left: 0
                }}
            ></div> */}
        </React.Fragment>
    );

    const pointer_events_disabled =
        operator_type.current &&
        CHANGE_OPERATOR.includes(operator_type.current);

    const getCurrentChildren = useCallback(() => {
        const children = [child.props.children];

        if (props.mode === LayoutMode.edit) {
            // 拖拽过程中让所有元素都可以触发move事件，但是释放了以后还要能选中
            if (pointer_events_disabled) {
                children.push(mask_handler);
            }

            // 让drag_handler放置在最上面
            if (is_draggable && need_border_draggable_handler) {
                children.push(draggable_handler);
            }
        }

        return children;
    }, [
        pointer_events_disabled,
        operator_type,
        child,
        need_border_draggable_handler,
        props.is_checked,
        props.is_placeholder
    ]);

    const setTransition = () => {
        const transition = 'all 0.2s cubic-bezier(.25,.1,.25,1)';

        if (props.is_placeholder) return transition;

        if (props.is_checked || is_sticky_target) return 'none';

        return transition;
    };

    const out = calcItemPosition();

    // 监听页面变换
    resizeObserver(item_ref, () => {
        setItemResize(Math.random());
    });

    // Sticky实现：根据浏览器支持情况选择最佳方案
    const getStickyStyle = () => {
        if (!is_sticky || !is_sticky_target) {
            return {};
        }

        // 方案1：原生sticky（推荐，性能最佳）
        // 如果在你的使用场景中原生sticky工作正常，这是最好的选择
        return {
            position: 'sticky' as const,
            top: 0,
            zIndex: 1000,
            // GPU加速优化
            transform: 'translateZ(0)',
            willChange: 'transform'
        };

        // 方案2：如果原生sticky在嵌套布局中有问题，可以尝试以下fixed实现
        // 注意：需要根据实际的DOM结构调整坐标计算
        /*
        if (!props.canvas_viewport_ref.current) return {};

        const viewport = props.canvas_viewport_ref.current;
        const viewportRect = viewport.getBoundingClientRect();
        const scrollTop = viewport.scrollTop;

        // 只有当元素应该sticky时才应用fixed定位
        const shouldStick = scrollTop > out.y;

        if (!shouldStick) return {};

        return {
            position: 'fixed' as const,
            top: viewportRect.top,
            left: viewportRect.left + out.x,
            zIndex: 1000,
            width: out.w,
            transform: 'translateZ(0)',
            willChange: 'transform'
        };
        */
    };

    /**
     * 优化的flex高度计算逻辑
     * 使用IntersectionObserver和requestAnimationFrame提高性能
     */
    useEffect(() => {
        let rafId: number;
        let isMounted = true;

        if (
            is_init &&
            item_ref.current &&
            props.is_flex &&
            !props.is_placeholder &&
            operator_type.current !== OperatorType.resize
        ) {
            const { min_h } = getMinimumBoundary();

            // 使用requestAnimationFrame确保DOM更新完成
            rafId = requestAnimationFrame(() => {
                if (!isMounted || !item_ref.current) return;

                const currentHeight = item_ref.current.offsetHeight;

                // 添加防抖机制，避免频繁更新
                if (Math.abs(currentHeight - (out.inner_h || 0)) > 2) {
                    out.h = Math.max(currentHeight, min_h) + props.margin_y;
                    out.inner_h = currentHeight;

                    if (isMounted) {
                        setInitResize(true);
                        props.changeWidgetHeight?.(out);
                    }
                }
            });
        }

        return () => {
            isMounted = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [is_item_resize, is_init]);

    // 优化的ResizeObserver，使用防抖减少频繁触发
    useEffect(() => {
        if (!props.is_flex || props.is_placeholder) return;

        let resizeTimer: NodeJS.Timeout;
        let isMounted = true;
        let resizeObserverInstance: ResizeObserver | null = null;

        const debouncedResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (isMounted) {
                    setItemResize(Math.random());
                }
            }, 16); // 约60fps的更新频率
        };

        // 使用优化的resizeObserver
        resizeObserverInstance = new ResizeObserver(debouncedResize);

        if (item_ref.current) {
            resizeObserverInstance.observe(item_ref.current);
        }

        return () => {
            isMounted = false;
            clearTimeout(resizeTimer);
            if (resizeObserverInstance) {
                resizeObserverInstance.disconnect();
                resizeObserverInstance = null;
            }
        };
    }, [props.is_flex, props.is_placeholder]);



    useEffect(() => {
        setInitResize(false);
        setInit(true);
    }, []);

    const new_child = React.cloneElement(child, {
        key: i,
        tabIndex: i,
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            if (operator_type.current == undefined) {
                props.setCurrentChecked?.(i);
            }
        },
        onKeyDown: (e: React.KeyboardEvent) => {
            if (type === WidgetType.drag && props.need_position_change) {
                const keydown_pos = handleKeyDown(e);
                if (keydown_pos) {
                    props.onPositionChange?.(
                        {
                            ...{ x, y, h, w, inner_h, i, type },
                            ...keydown_pos
                        },
                        e as unknown as MouseEvent
                    );
                }
            }
        },
        ref: item_ref,
        id: `${child.props.id
            ? child.props.id + ' layout_item_' + i
            : 'layout_item_' + i
            }`,
        className: `${[
            child.props.className,
            styles.layout_item,
            // 处理drag事件在画布中不生效的情况
            pointer_events_disabled ? styles.iframe_mask : '',
            props.is_checked && !props.is_placeholder
                ? styles['checked-border']
                : ''
        ].join(' ')}`,
        style: {
            border: '1px solid transparent',
            width: out.w,
            // 拷贝到shadow上的内部高度无法撑开,使用拷贝元素的计算值
            height:
                props.is_flex && !props.is_placeholder
                    ? /** 骨架展位 */
                    props.use_skeleton
                        ? props.skeleton_h ?? props.inner_h
                        : 'unset'
                    : props.inner_h,
            ...child.props.style,
            cursor:
                props.is_draggable && !props.need_border_draggable_handler
                    ? 'grab'
                    : 'inherit',
            position: 'absolute',
            zIndex: is_dragging ? 1000 : 'auto',
            transition: setTransition(),
            // 应用优化的sticky样式
            ...getStickyStyle()
        },
        children: getCurrentChildren()
    });

    /**
     * 获取模块最小范围
     */
    const getMinimumBoundary = () => {
        let minDragNumberX = 10,
            minDragNumberY = 10;

        if (type === WidgetType.drag) {
            const { min_x, min_y } = getDragMinBound(
                item_ref,
                minDragNumberX,
                minDragNumberY
            );
            minDragNumberX = min_x;
            minDragNumberY = min_y;
        }

        const bound_strategy = {
            [WidgetType.drag]: {
                min_w: props.min_w ?? minDragNumberX,
                min_h: props.min_h ?? minDragNumberY
            },
            [WidgetType.grid]: {
                min_w: (props.min_w ?? 2) * col_width,
                min_h: (props.min_h ?? 2) * row_height
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
                is_flex,
                inner_h,
                type,
                is_resizable,
                is_draggable,
                layout_id,
                is_init_resize
            }
        }),
        [
            i,
            layout_id,
            x,
            y,
            w,
            h,
            is_flex,
            inner_h,
            type,
            is_resizable,
            is_draggable,
            is_init_resize
        ]
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
                x={out.x}
                y={out.y}
                key={i}
                threshold={5}
                use_css_transform={false}
                scale={props.scale}
                is_draggable={is_draggable}
                onMouseDown={() => {
                    if (checked_index) {
                        if (checked_index !== i) {
                            return false;
                        }
                        return true;
                    } else {
                        props.setCurrentChecked?.(i);
                        return true;
                    }
                }}
                onDragStart={({ e, x, y }) => {
                    props.onDragStart?.(
                        {
                            x: x,
                            y: y,
                            w: out.w,
                            h: out.h,
                            inner_h: out.inner_h,
                            type,
                            i
                        },
                        e
                    );
                }}
                draggable_handler={
                    need_border_draggable_handler
                        ? `.draggable_handler`
                        : undefined
                }
                draggable_cancel_handler={
                    props.draggable_cancel_handler
                        ? [props.draggable_cancel_handler]
                        : []
                }
                onDrag={({ e, x, y }) => {
                    if (!is_scrolling) {
                        scrollToBottom(e);
                        scrollToTop(e);
                    }

                    props.onDrag?.(
                        {
                            x: x,
                            y: y,
                            w: out.w,
                            h: out.h,
                            inner_h: out.inner_h,
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
                            inner_h: out.inner_h,
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
                    x={out.x}
                    y={out.y}
                    w={out.w}
                    h={out.inner_h}
                    scale={props.scale}
                    use_css_transform={false}
                    is_resizable={is_resizable}
                    onResizeStart={({ e, x, y, h, w }) => {
                        props.onResizeStart?.(
                            {
                                x,
                                w,
                                y,
                                h:
                                    (props.is_flex
                                        ? item_ref.current!.offsetHeight
                                        : h) + props.margin_y,
                                inner_h: props.is_flex
                                    ? item_ref.current!.offsetHeight
                                    : h,
                                type,
                                i
                            },
                            e
                        );
                    }}
                    cursors={
                        props.is_flex
                            ? [CursorType.e, CursorType.w]
                            : props.cursors
                    }
                    onResize={({ e, x, y, w, h }) => {
                        if (!is_scrolling) {
                            scrollToTop(e);
                            scrollToBottom(e);
                        }

                        props.onResize?.(
                            {
                                x,
                                w,
                                y,
                                h:
                                    (props.is_flex
                                        ? item_ref.current!.offsetHeight
                                        : h) + props.margin_y,
                                inner_h: props.is_flex
                                    ? item_ref.current!.offsetHeight
                                    : h,
                                type,
                                i
                            },
                            e
                        );
                    }}
                    {...getMinimumBoundary()}
                    onResizeStop={({ e, x, y, w, h }) => {
                        props.onResizeStop?.(
                            {
                                x,
                                w,
                                y,
                                h:
                                    (props.is_flex
                                        ? item_ref.current!.offsetHeight
                                        : h) + props.margin_y,
                                inner_h: props.is_flex
                                    ? item_ref.current!.offsetHeight
                                    : h,
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



export default memo(WidgetItem, compareProps);

function compareProps<T extends Record<string, any>>(prev: Readonly<T>, next: Readonly<T>): boolean {
    return !Object.keys(prev)
        .map((key) => {
            if (
                [
                    'moved',
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
                if (
                    !prev.is_flex &&
                    ['changeWidgetHeight', 'toXWpx'].includes(key)
                ) {
                    return true;
                }

                /** 如果正在拖拽，children 不进行比较 */
                const operator = prev.operator_type?.current;
                if (
                    operator &&
                    [
                        OperatorType.drag,
                        OperatorType.drop,
                        OperatorType.resize
                    ].includes(operator)
                ) {
                    if (['children'].includes(key)) {
                        return true;
                    }

                    /** 截流处理：如果前后两次的高度差小于3，不重绘 */
                    if (
                        !prev.is_placeholder &&
                        typeof prev[key] === 'number' && typeof next[key] === 'number' &&
                        Math.abs(prev[key] - next[key]) <= 1
                    ) {
                        return true;
                    }
                }

                // --!isEqual(prev[key], next[key]) &&
                //     console.log(prev, prev['i'], key, prev[key], next[key]);
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
