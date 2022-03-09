import React, {
    Fragment,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useLayoutEffect
} from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import WidgetItem from '../canvas/layout-item';
import {
    compact,
    getDropItem,
    moveElement,
    snapToGrid,
    getCurrentMouseOverWidget,
    cloneWidget,
    moveToWidget,
    replaceWidget
} from './calc';
import styles from './styles.module.css';
import {
    EditLayoutProps,
    ItemPos,
    LayoutItem,
    LayoutType,
    OperatorType,
    ReactDragLayoutProps,
    RulerPointer,
    LayoutItemDimesion,
    LayoutEntry,
    LayoutDescriptor
} from '@/interfaces';
import GuideLine from '../guide-line';
import { copyObject, copyObjectArray, noop } from '@/utils/utils';
import { addEvent, removeEvent } from '@pearone/event-utils';
import { clamp, DEFAULT_BOUND } from '../canvas/draggable';
import { LayoutContext } from '../layout-context';
import { useLayoutHooks } from './hooks';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const {
        checked_index,
        setCurrentChecked,
        operator_type,
        setOperatorType,
        registry,
        dragging_layout
    } = useContext(LayoutContext);

    const container_ref = useRef<HTMLDivElement>(null);
    const canvas_viewport = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_widget_ref = useRef<HTMLDivElement>(null);

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [shadow_widget, setShadowWidget] = useState<ItemPos>();
    const [old_shadow_widget, setOldShadowWidget] = useState<ItemPos>();

    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置

    const {
        current_width,
        padding,
        grid,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset
    } = useLayoutHooks(
        layout,
        props,
        canvas_viewport,
        shadow_widget_ref,
        shadow_widget,
        operator_type
    );

    // useImperativeHandle(ref, () => ({
    //     getWrapperSize: () => {
    //         return { wrapper_width, wrapper_height };
    //     }
    // }));

    /**
     * @description 当操作结束以后更新操作状态为undefined
     */
    useEffect(() => {
        if (
            operator_type &&
            [
                OperatorType.changeover,
                OperatorType.dragover,
                OperatorType.dropover,
                OperatorType.resizeover
            ].includes(operator_type)
        ) {
            setTimeout(() => {
                setOperatorType(undefined);
            }, 0);
        }
    }, [operator_type]);

    /**
     * @description 只有在无状态的情况下，点击空白处才会取消选中状态
     */
    const onClick = (e: React.MouseEvent) => {
        if (operator_type === undefined) {
            setCurrentChecked(undefined);
        }
    };

    const layout_name = useMemo(() => {
        return `layout_name_${(Math.random() * 100).toFixed(0)}`;
    }, []);

    /** 根据类型配置计算边界状态 */
    const getCurrentBound = (is_float: boolean) => {
        if (is_float) {
            return props.need_drag_bound
                ? {
                      min_x: padding.left,
                      max_x: current_width - padding.right,
                      min_y: padding.top,
                      max_y: Infinity
                  }
                : DEFAULT_BOUND;
        } else {
            return props.need_grid_bound
                ? {
                      min_x: 0,
                      max_x: props.cols,
                      min_y: 0,
                      max_y: Infinity
                  }
                : DEFAULT_BOUND;
        }
    };

    /**
     * 获取组件实际宽高
     * 组件信息补全
     */
    function getCurrentWidget(item: LayoutItem) {
        item.w = Math.max(item.min_w ?? (item.is_float ? 5 : 1), item.w);
        item.h = Math.max(item.min_h ?? (item.is_float ? 5 : 1), item.h);

        item.is_float = item.is_float ?? false;
        item.is_draggable = item.is_draggable ?? false;
        item.is_resizable = item.is_resizable ?? false;
        item.is_nested = item.is_nested ?? false;
        item.covered = item.covered ?? false;
        item.is_dragging = item.is_dragging ?? false;
        item.is_checked = item.is_checked ?? false;
        item.moved = item.moved ?? false;
        item.need_mask = item.need_mask ?? false;

        return getBoundResult(item);
    }

    /**
     * 根据children信息生成layout
     */
    useEffect(() => {
        const new_layout = React.Children.toArray(props.children).map(
            (child: React.ReactElement) => {
                const item = cloneWidget(
                    child.props['data-drag']
                ) as LayoutItem;
                return getCurrentWidget(item);
            }
        );
        compact(new_layout);
        setLayout(new_layout);
    }, [props.children, grid, padding]);

    const onDragEnter = (e: React.MouseEvent) => {
        console.log('onDragEnter');
        e.preventDefault();
    };

    /** 处理拖拽出画布外没有隐藏shadow的情况 */
    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!canvas_ref.current!.contains(e.relatedTarget as Node)) {
            // 如果是canvas内的子节点会被触发leave
            setShadowWidget(undefined);
            setOldShadowWidget(undefined);
            compact(layout);
            setLayout(layout);
        }
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOperatorType(OperatorType.dropover);

        if (shadow_widget) {
            const item = (props as EditLayoutProps).onDrop?.(
                layout ?? [],
                shadow_widget
            );

            setShadowWidget(undefined);
            setOldShadowWidget(undefined);

            if (item && item.i) {
                setCurrentChecked(item.i);
            }
        }
    };

    /** 对drop节点做边界计算以后再排序 */
    const getBoundResult = (item: LayoutItem) => {
        const { max_x, min_x, max_y, min_y } = getCurrentBound(item.is_float);

        item.w = clamp(item.w, min_x, max_x);
        item.x = clamp(item.x, min_x, max_x - item.w);
        item.h = clamp(item.h, min_y, max_y);
        item.y = clamp(item.y, min_y, max_y - item.h);

        return item;
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();

        const collides = getCurrentMouseOverWidget(
            layout!,
            canvas_ref,
            e,
            props.scale,
            grid
        );

        if (collides && collides.is_nested) {
            setShadowWidget(undefined);
            setOldShadowWidget(undefined);
            compact(layout);
            setLayout(layout);
        } else {
            const shadow_widget = getBoundResult(
                getDropItem(canvas_ref, e, props, grid)
            );
            if (
                old_shadow_widget &&
                shadow_widget.x === old_shadow_widget.x &&
                shadow_widget.y === old_shadow_widget.y
            ) {
                return;
            }
            setShadowWidget(shadow_widget);
            setOldShadowWidget(cloneWidget(shadow_widget));
            const new_layout = [shadow_widget, ...layout];
            compact(new_layout);
            setLayout(layout);
        }
    };

    const getCurrentLayoutByItem = useCallback(
        (type: OperatorType, item: ItemPos, is_save?: boolean) => {
            setOperatorType(type);
            const current_widget = getLayoutItem(item);

            moveToWidget(current_widget, item);

            // 当前拖拽元素 原Layout 处理元素移除逻辑
            if (
                dragging_layout.current?.layout.descriptor.id &&
                dragging_layout.current?.layout.descriptor.id !==
                    props.layout_id
            ) {
                const filter_layout = getFilterLayout(item);
                setLayout(copyObject(layout));
                compact(filter_layout);
                return layout;
            }

            if (!current_widget.is_float) {
                const shadow_widget = cloneWidget(current_widget);
                const filter_layout = getFilterLayout(item);
                snapToGrid(shadow_widget, grid);
                moveElement(
                    filter_layout,
                    shadow_widget,
                    shadow_widget.x,
                    shadow_widget.y,
                    true
                );

                compact(filter_layout.concat([shadow_widget]));
                if (is_save) {
                    current_widget.is_dragging = false;
                    moveToWidget(current_widget, shadow_widget);
                    setShadowWidget(undefined);
                } else {
                    current_widget.is_dragging = true;
                    setShadowWidget(shadow_widget);
                }
            }
            setLayout(layout);
            return replaceWidget(layout, shadow_widget);
        },
        [layout, grid]
    );

    const shadowGridItem = () => {
        return (
            dragging_layout.current?.layout.descriptor.id === props.layout_id &&
            shadow_widget && (
                <WidgetItem
                    layout_id={props.layout_id}
                    ref={shadow_widget_ref}
                    {...shadow_widget}
                    is_placeholder={true}
                    bound={getCurrentBound(shadow_widget.is_float)}
                    padding={padding}
                    scale={props.scale}
                    margin={props.item_margin}
                    mode={LayoutType.view}
                    grid={grid}
                    layout_type={props.layout_type}
                    is_resizable={false}
                    is_draggable={false}
                    is_checked={false}
                    layout_nested={props.is_nested}
                >
                    <div
                        className={`react-drag-placeholder ${styles.placeholder}`}
                    ></div>
                </WidgetItem>
            )
        );
    };

    const processGridItem = (widget: LayoutItem, child: React.ReactElement) => {
        if (widget) {
            return (
                <WidgetItem
                    layout_type={props.layout_type}
                    layout_id={props.layout_id}
                    key={widget.i}
                    {...widget}
                    {...child.props}
                    padding={padding}
                    grid={grid}
                    bound={getCurrentBound(widget.is_float)}
                    layout_nested={props.is_nested}
                    mode={props.mode}
                    children={child}
                    scale={props.scale}
                    margin={props.item_margin}
                    is_checked={checked_index === widget.i}
                    is_resizable={
                        widget.is_resizable && checked_index === widget.i
                    }
                    setCurrentChecked={
                        props.mode === LayoutType.edit
                            ? setCurrentChecked
                            : noop
                    }
                    onDragStart={() => {
                        checked_index === widget.i
                            ? (props as EditLayoutProps).onDragStart?.()
                            : noop;
                    }}
                    onDrag={(item) => {
                        if (checked_index === widget.i) {
                            const layout = getCurrentLayoutByItem(
                                OperatorType.drag,
                                item,
                                false
                            );
                            (props as EditLayoutProps).onDrag?.(layout ?? []);
                        }
                    }}
                    onDragStop={(item) => {
                        if (checked_index === widget.i) {
                            getCurrentLayoutByItem(
                                OperatorType.dragover,
                                item,
                                true
                            );
                            // (props as EditLayoutProps).onDragStop?.(
                            //     layout ?? []
                            // );
                        }
                    }}
                    onResizeStart={() => {
                        if (checked_index === widget.i) {
                            (props as EditLayoutProps).onResizeStart?.();
                        }
                    }}
                    onResize={(item) => {
                        if (checked_index === widget.i) {
                            const layout = getCurrentLayoutByItem(
                                OperatorType.resize,
                                item,
                                false
                            );
                            (props as EditLayoutProps).onResize?.(layout ?? []);
                        }
                    }}
                    onResizeStop={(item) => {
                        if (checked_index === widget.i) {
                            const layout = getCurrentLayoutByItem(
                                OperatorType.resizeover,
                                item,
                                true
                            );
                            (props as EditLayoutProps).onResizeStop?.(
                                layout ?? []
                            );
                        }
                    }}
                    onPositionChange={(item) => {
                        if (checked_index === widget.i) {
                            const layout = getCurrentLayoutByItem(
                                OperatorType.changeover,
                                item,
                                true
                            );
                            (props as EditLayoutProps).onPositionChange?.(
                                layout ?? []
                            );
                        }
                    }}
                />
            );
        } else {
            return <Fragment></Fragment>;
        }
    };

    const getLayoutItem = useCallback(
        (item: ItemPos) => {
            return layout!.find((l) => {
                return l.i == item.i;
            }) as LayoutItem;
        },
        [layout]
    );

    const getFilterLayout = useCallback(
        (item: ItemPos) => {
            return layout!.filter((l) => {
                return l.i !== item.i;
            });
        },
        [layout]
    );

    const offsetXYFromLayout = (element: HTMLElement) => {
        const child = element.getBoundingClientRect();
        const parent = canvas_ref.current!.getBoundingClientRect();
        return { x: child.x - parent.x, y: child.y - parent.y };
    };

    const compactLayoutByDraggingItem = useCallback(
        (dragging_item: NonNullable<LayoutItemDimesion>, is_save = false) => {
            const { x, y } = offsetXYFromLayout(dragging_item.element!);
            const placeholder = {
                x,
                y,
                i: dragging_item.i,
                h: dragging_item.h,
                w: dragging_item.w,
                is_float: dragging_item.is_float,
                is_nested: dragging_item.is_nested
            };

            if (is_save) {
                snapToGrid(placeholder, grid);
                compact(layout.concat(placeholder));
                (props as EditLayoutProps).onDrop?.(layout ?? [], placeholder);
            } else {
                snapToGrid(placeholder, grid);
                compact(layout.concat(placeholder));
                setShadowWidget(placeholder);
            }
        },
        [layout]
    );

    const getLayoutStyle = () => {
        const transform = props.is_nested
            ? {}
            : {
                  transform: `scale(${props.scale})`,
                  transformOrigin: '0 0'
              };

        return {
            ...props.style,
            width: current_width,
            height: current_height,
            top: t_offset,
            left: l_offset,
            overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden',
            ...transform
        };
    };

    const handlerShadowByDraggingItem = useCallback(
        (dragging_item: NonNullable<LayoutItemDimesion>) => {
            if (dragging_item.layout_id === props.layout_id) {
                return;
            } else {
                compactLayoutByDraggingItem(dragging_item);
            }
        },
        [layout, props.layout_id, compactLayoutByDraggingItem]
    );

    const handlerDraggingItemOut = useCallback(
        (dragging_item: NonNullable<LayoutItemDimesion>) => {
            setShadowWidget(undefined);
            const filter_layout = getFilterLayout(dragging_item);
            compact(filter_layout);
            setLayout(layout);
        },
        [layout, getFilterLayout]
    );

    const handlerRemoveWidget = useCallback(
        (dragging_item: NonNullable<LayoutItemDimesion>) => {
            (props as EditLayoutProps).onDragStop?.(
                layout.filter((l) => l.i !== dragging_item.i) ?? []
            );
        },
        [layout]
    );

    const handlerAddWidget = useCallback(
        (dragging_item: NonNullable<LayoutItemDimesion>) => {
            compactLayoutByDraggingItem(dragging_item, true);
            // setLayout(
            //     layout.concat({
            //         ...shadow_widget!,
            //         i: dragging_item.i,
            //         is_nested: dragging_item.is_nested
            //     })
            // );
        },
        [compactLayoutByDraggingItem]
    );

    const descriptor: LayoutDescriptor = useMemo(
        () => ({
            id: props.layout_id,
            type: props.layout_type,
            mode: props.mode,
            is_root: !props.is_nested
        }),
        [props.layout_id, props.layout_type, props.mode, props.is_nested]
    );

    const getRef = useCallback(() => canvas_ref.current, []);

    const entry: LayoutEntry = useMemo(
        () => ({
            handlerShadowByDraggingItem,
            handlerDraggingItemOut,
            handlerRemoveWidget,
            handlerAddWidget,
            descriptor,
            getRef,
            unique_id: layout_name
        }),
        [handlerShadowByDraggingItem, descriptor, layout_name]
    );

    useLayoutEffect(() => {
        registry.droppable.register(entry);
        return () => registry.droppable.unregister(entry);
    }, [registry.droppable, entry]);

    return (
        <div
            className={`react-drag-layout ${styles.container} ${props.className}`}
            ref={container_ref}
        >
            {/* 水平标尺 */}
            {canvas_viewport.current && props.need_ruler && (
                <HorizontalRuler
                    {...props}
                    width={current_width}
                    l_offset={l_offset!}
                    wrapper_width={wrapper_width}
                    setRulerHoverPos={setRulerHoverPos}
                    canvas_viewport={canvas_viewport}
                ></HorizontalRuler>
            )}
            {/* 可视区域窗口 */}
            <div
                style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
                ref={canvas_viewport}
                id={'canvas_viewport'}
            >
                {/* 垂直标尺 */}
                {canvas_viewport.current && props.need_ruler && (
                    <VerticalRuler
                        {...props}
                        height={current_height}
                        t_offset={t_offset!}
                        wrapper_height={wrapper_height}
                        setRulerHoverPos={setRulerHoverPos}
                        canvas_viewport={canvas_viewport}
                    ></VerticalRuler>
                )}

                <div
                    style={{
                        overflowX: props.is_nested ? 'hidden' : 'auto',
                        overflowY: 'auto',
                        position: 'relative',
                        flex: 1,
                        scrollBehavior: 'smooth'
                    }}
                >
                    {/* 画板区域 */}
                    <div
                        id={'canvas_wrapper'}
                        ref={canvas_wrapper}
                        style={{
                            width: wrapper_width,
                            height: wrapper_height
                        }}
                        /** 阻止了onDragOver以后，onDrop事件才生效 */
                        onDrop={props.mode === LayoutType.edit ? onDrop : noop}
                        onDragOver={
                            props.mode === LayoutType.edit ? onDragOver : noop
                        }
                        onDragLeave={
                            props.mode === LayoutType.edit ? onDragLeave : noop
                        }
                        onDragEnter={
                            props.mode === LayoutType.edit ? onDragEnter : noop
                        }
                        onClick={onClick}
                        // onMouseMove={(e) => {
                        //     e.stopPropagation();
                        //     e.nativeEvent.console.log(
                        //         'move on aaa',
                        //         layout_name
                        //     );
                        // }}
                    >
                        {/* 实际画布区域 */}
                        <div
                            id={layout_name}
                            ref={canvas_ref}
                            className={styles.canvas}
                            style={getLayoutStyle()}
                        >
                            {shadowGridItem()}
                            {React.Children.map(
                                props.children,
                                (child, idx) => {
                                    const widget = layout?.[idx];
                                    return processGridItem(widget, child);
                                }
                            )}
                        </div>
                        <div style={{ position: 'absolute', zIndex: 100 }}>
                            {layout_name}
                        </div>
                    </div>
                </div>
            </div>

            {/* {props.mode === LayoutType.edit && canvas_viewport.current && (
                <GuideLine
                    scale={(props as DragLayoutProps).scale}
                    t_offset={t_offset}
                    l_offset={l_offset}
                    guide_lines={props.guide_lines}
                    canvas_viewport={canvas_viewport}
                    ruler_hover_pos={ruler_hover_pos}
                    removeGuideLine={props.removeGuideLine}
                ></GuideLine>
            )} */}
        </div>
    );
};

ReactDragLayout.defaultProps = {
    scale: 1,
    cols: 10,
    width: 200,
    height: 200,
    row_height: 20,
    container_padding: [0] as [number],
    item_margin: [0, 0],
    mode: LayoutType.view,
    need_ruler: false,
    need_grid_bound: true,
    need_drag_bound: true,
    is_nested: false
};

export default ReactDragLayout;
