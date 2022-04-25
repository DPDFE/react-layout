import React, {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useLayoutEffect,
    memo,
    useContext,
    RefObject
} from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import WidgetItem from './canvas/layout-item';
import {
    compact,
    moveElement,
    cloneWidget,
    moveToWidget,
    replaceWidget,
    getDropPosition,
    removePersonalValue,
    addPersonalValue
} from './calc';
import styles from './styles.module.css';
import {
    LayoutMode,
    ItemPos,
    LayoutItem,
    LayoutType,
    OperatorType,
    RulerPointer,
    LayoutEntry,
    LayoutDescriptor,
    LayoutItemEntry,
    ReactLayoutProps,
    GridType,
    WidgetLocation,
    WidgetType,
    EditLayoutProps
} from '@/interfaces';
import GuideLine from '../guide-line';
import { copyObject, noop } from '@/utils/utils';
import { clamp } from './canvas/draggable';
import { useLayoutHooks } from './hooks';
import isEqual from 'lodash.isequal';
import { LayoutContext } from './context';
import drawGridLines from './grid-lines';
import classNames from 'classnames';

const ReactLayout = (props: ReactLayoutProps) => {
    const {
        checked_index,
        setCurrentChecked,
        operator_type,
        setOperatorType,
        registry,
        dragging_layout,
        dragging_layout_id,
        getResponders
    } = useContext(LayoutContext);

    const container_ref = useRef<HTMLDivElement>(null);
    const canvas_viewport_ref = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper_ref = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动
    const grid_lines_ref = useRef<HTMLCanvasElement>(null); //
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_widget_ref = useRef<HTMLDivElement>(null);
    const flex_container_ref = useRef<HTMLDivElement>(null);

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [shadow_widget, setShadowWidget] = useState<ItemPos>();

    const [source_layout, setSourceLayout] = useState<LayoutItem[]>([]);
    const pre_source_layout = useRef<LayoutItem[]>();
    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置

    const layout_name = useMemo(() => {
        return `${props.layout_id}`;
    }, []);

    const {
        current_width,
        grid,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset,
        padding,
        is_child_layout,
        canvas_viewport_scroll_top_left,
        getBoundResult,
        getCurrentBound,
        snapToDrag,
        snapToGrid
    } = useLayoutHooks(
        layout,
        props,
        container_ref,
        canvas_viewport_ref,
        shadow_widget_ref,
        shadow_widget
    );

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
            setOperatorType(undefined);
        }
    }, [operator_type]);

    /**
     * @description 只有在无状态的情况下，点击空白处才会取消选中状态
     */
    const onClick = useCallback(
        (e: MouseEvent) => {
            if (
                e.target === canvas_ref.current &&
                operator_type === undefined &&
                !is_child_layout
            ) {
                setCurrentChecked(undefined);
            }
        },
        [operator_type, is_child_layout]
    );

    /**
     * 获取组件实际宽高
     * 组件信息补全
     */
    function ensureWidgetModelValid(item: LayoutItem) {
        item.type = item.type ?? WidgetType.drag;
        item.is_draggable = item.is_draggable ?? false;
        item.is_resizable = item.is_resizable ?? false;
        item.need_border_draggable_handler =
            item.need_border_draggable_handler ?? false;
        item.is_droppable = item.is_droppable ?? false;

        const is_float = item.type === WidgetType.drag;
        item.w = Math.max(item.min_w ?? (is_float ? 5 : 1), item.w);
        item.h = Math.max(item.min_h ?? (is_float ? 5 : 1), item.h);
    }

    /**
     * layout 不变不做事情
     */
    useEffect(() => {
        if (!isEqual(pre_source_layout.current, source_layout)) {
            const new_layout = source_layout.map((item) => {
                return addPersonalValue(item);
            });
            compact(new_layout);
            setLayout(new_layout);
        }

        pre_source_layout.current = source_layout;
    }, [source_layout]);

    /**
     * 根据children信息生成layout
     */
    useEffect(() => {
        if (props.children) {
            const new_layout = React.Children.toArray(props.children).map(
                (child: React.ReactElement) => {
                    const item = child.props['data-drag'] as LayoutItem;
                    ensureWidgetModelValid(item);
                    getBoundResult(item);
                    return { ...item };
                }
            );
            setSourceLayout(new_layout);
        }
    }, [props.children]);

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOperatorType(OperatorType.dropover);

        if (shadow_widget) {
            const item = handleResponder(
                OperatorType.dropover,
                removePersonalValue(layout),
                shadow_widget
            );

            setShadowWidget(undefined);
            compact(layout);
            setLayout(layout);

            if (item && item.i) {
                setCurrentChecked(item.i);
            }
        }
    };

    const getDropItem = (
        canvas_ref: RefObject<HTMLElement>,
        e: React.MouseEvent,
        props: ReactLayoutProps,
        grid: GridType
    ): ItemPos => {
        const { scale, layout_type } = props;
        const { x, y } = getDropPosition(canvas_ref, e, scale);

        const responders = getResponders();
        const drop_item = responders.getDroppingItem?.();

        const i = drop_item ? drop_item.i : '__dropping_item__';

        if (layout_type === LayoutType.GRID) {
            const w = grid.col_width * (drop_item?.w ?? 2);
            const h = grid.row_height * (drop_item?.h ?? 2);

            const pos = { ...drop_item, w, h, i, x, y, type: WidgetType.grid };

            snapToGrid(pos);

            return pos;
        } else {
            const w = drop_item ? drop_item.w : 100;
            const h = drop_item ? drop_item.h : 100;

            return { w, h, i, x, y, type: WidgetType.drag, is_droppable: true };
        }
    };

    // 处理拖拽添加，元素移除边界的情况
    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const pre_layout = registry.droppable.getById(props.layout_id);
        pre_layout.handlerDraggingItemOut();
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (
            dragging_layout_id.current &&
            dragging_layout_id.current !== props.layout_id
        ) {
            const pre_layout = registry.droppable.getById(
                dragging_layout_id.current
            );
            pre_layout.handlerDraggingItemOut();
        }

        dragging_layout_id.current = props.layout_id;

        const shadow_widget = getBoundResult(
            getDropItem(canvas_ref, e, props, grid)
        );

        setShadowWidget(shadow_widget);
        const new_layout = [shadow_widget, ...layout];
        compact(new_layout);
        setLayout(layout);
    };

    // 现在这个数据接口有些复杂
    const handleResponder = (
        type: OperatorType,
        source_layout: LayoutItem[],
        widget: LayoutItem,
        destination?: WidgetLocation,
        layout_id?: string
    ) => {
        const data = {
            type,
            widget_id: widget.i,
            source: {
                layout_id: props.layout_id,
                widgets: copyObject(source_layout)
            }
        };
        setOperatorType(type);
        const responders = getResponders();
        switch (type) {
            case OperatorType.dragstart:
                // 触发onDragStart事件
                setCurrentChecked(widget.i);
                responders.onDragStart?.(data);
                break;
            case OperatorType.resizestart:
                setCurrentChecked(widget.i);
                responders.onResizeStart?.(data);
                break;
            case OperatorType.resize:
                responders.onResize?.(data);
                break;
            case OperatorType.resizeover:
                responders.onResizeStop?.(data);
                break;
            // drop 事件需要return回调值
            case OperatorType.dropover:
                return responders.onDrop?.({ ...data, widget });
            case OperatorType.drag:
                responders.onDrag?.({ ...data, destination });
                break;
            case OperatorType.dragover:
                responders.onDragStop?.({ ...data, destination });
                break;
            case OperatorType.changeover:
                setCurrentChecked(widget.i);
                responders.onPositionChange?.(data);
                break;
        }

        if (
            [
                OperatorType.changeover,
                OperatorType.dragover,
                OperatorType.resizeover
            ].includes(type)
        ) {
            responders.onChange?.({ ...data, destination });
        }

        return;
    };

    const getDestinationLayoutByItem = useCallback(
        (type: OperatorType, widget: LayoutItem, is_save: boolean) => {
            if (
                widget.is_droppable &&
                dragging_layout_id.current &&
                dragging_layout_id.current !== props.layout_id
            ) {
                const droppable = registry.droppable.getById(
                    dragging_layout_id.current
                );
                const dragging_item = registry.draggable.getById(widget.i);

                const widgets = droppable.compactLayoutByDraggingItem(
                    dragging_item,
                    is_save
                );

                if (type === OperatorType.drag) {
                    dragging_layout.current = {
                        layout: droppable,
                        drag_item: dragging_item
                    };
                } else {
                    dragging_layout.current = undefined;
                }

                return {
                    widgets: removePersonalValue(widgets),
                    layout_id: dragging_layout_id.current
                };
            }

            return;
        },
        [registry, props.layout_id, dragging_layout_id, source_layout]
    );

    const getCurrentLayoutByItem = useCallback(
        (item: ItemPos, is_save?: boolean) => {
            const current_widget = getLayoutItem(item);

            moveToWidget(current_widget, item);

            current_widget.is_dragging = is_save ? false : true;

            // 当前拖拽元素 原Layout 处理元素移除逻辑
            if (
                current_widget.is_droppable &&
                dragging_layout_id.current &&
                dragging_layout_id.current !== props.layout_id
            ) {
                const filter_layout = getFilterLayout(item);
                setLayout(copyObject(layout));
                compact(filter_layout);
                setShadowWidget(undefined);
                if (is_save) {
                    setLayout(filter_layout);
                }
                return {
                    layout: filter_layout,
                    widget: current_widget
                };
            }

            const shadow_widget = cloneWidget(current_widget);
            if (!(current_widget.type === WidgetType.drag)) {
                const filter_layout = getFilterLayout(item);
                const { top, left } = canvas_viewport_scroll_top_left.current;

                if (is_save) {
                    shadow_widget.x += left;
                    shadow_widget.y += top;
                }

                snapToGrid(shadow_widget);

                const { max_x, min_x, max_y, min_y } = getCurrentBound(
                    item.type
                );

                shadow_widget.x = clamp(
                    shadow_widget.x,
                    min_x,
                    max_x - shadow_widget.w
                );
                shadow_widget.y = clamp(
                    shadow_widget.y,
                    min_y,
                    max_y - shadow_widget.h
                );

                moveElement(
                    filter_layout,
                    shadow_widget,
                    shadow_widget.x,
                    shadow_widget.y,
                    true
                );

                compact(filter_layout.concat([shadow_widget]));
                if (is_save) {
                    moveToWidget(current_widget, shadow_widget);
                    setShadowWidget(undefined);
                } else {
                    setShadowWidget(shadow_widget);
                }
            }
            setLayout(copyObject(layout));

            return {
                layout: removePersonalValue(
                    replaceWidget(layout, shadow_widget)
                ),
                widget: current_widget
            };
        },
        [layout, grid, source_layout]
    );

    const shadowGridItem = () => {
        return (
            shadow_widget && (
                <WidgetItem
                    key='shadow'
                    {...snapToDrag(shadow_widget)}
                    layout_id={props.layout_id}
                    ref={shadow_widget_ref}
                    padding={padding}
                    margin={props.item_margin}
                    is_placeholder={true}
                    bound={getCurrentBound(shadow_widget.type)}
                    scale={props.scale}
                    mode={LayoutMode.view}
                    grid={grid}
                    is_resizable={false}
                    is_draggable={false}
                    is_checked={false}
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
                    layout_id={props.layout_id}
                    key={widget.i}
                    {...snapToDrag(widget)}
                    padding={padding}
                    margin={props.item_margin}
                    {...child.props}
                    grid={grid}
                    // bound={getCurrentBound(widget.type)}
                    is_child_layout={is_child_layout}
                    mode={props.mode}
                    children={child}
                    scale={props.scale}
                    cursors={(props as EditLayoutProps).cursors}
                    is_checked={checked_index === widget.i}
                    is_resizable={
                        widget.is_resizable && checked_index === widget.i
                    }
                    setCurrentChecked={
                        props.mode === LayoutMode.edit
                            ? setCurrentChecked
                            : noop
                    }
                    onDragStart={() => {
                        handleResponder(
                            OperatorType.dragstart,
                            removePersonalValue(layout),
                            widget
                        );
                    }}
                    onDrag={(item) => {
                        if (checked_index === widget.i) {
                            const {
                                layout: source_layout,
                                widget: current_widget
                            } = getCurrentLayoutByItem(item, false);
                            const destination = getDestinationLayoutByItem(
                                OperatorType.drag,
                                current_widget,
                                false
                            );
                            handleResponder(
                                OperatorType.drag,
                                source_layout,
                                current_widget,
                                destination
                            );
                        }
                    }}
                    onDragStop={(item) => {
                        if (
                            checked_index === widget.i &&
                            operator_type === OperatorType.drag
                        ) {
                            const {
                                layout: source_layout,
                                widget: current_widget
                            } = getCurrentLayoutByItem(item, true);
                            const destination = getDestinationLayoutByItem(
                                OperatorType.dragover,
                                current_widget,
                                true
                            );
                            handleResponder(
                                OperatorType.dragover,
                                source_layout,
                                current_widget,
                                destination
                            );
                        }
                    }}
                    onResizeStart={() => {
                        if (checked_index === widget.i) {
                            handleResponder(
                                OperatorType.resizestart,
                                layout,
                                widget
                            );
                        }
                    }}
                    onResize={(item) => {
                        if (checked_index === widget.i) {
                            const {
                                layout: source_layout,
                                widget: current_widget
                            } = getCurrentLayoutByItem(item, false);
                            handleResponder(
                                OperatorType.resize,
                                source_layout,
                                current_widget
                            );
                        }
                    }}
                    onResizeStop={(item) => {
                        if (checked_index === widget.i) {
                            const {
                                layout: source_layout,
                                widget: current_widget
                            } = getCurrentLayoutByItem(item, true);
                            handleResponder(
                                OperatorType.resizeover,
                                source_layout,
                                current_widget
                            );
                        }
                    }}
                    onPositionChange={(item) => {
                        if (checked_index === widget.i) {
                            const {
                                layout: source_layout,
                                widget: current_widget
                            } = getCurrentLayoutByItem(item, true);
                            handleResponder(
                                OperatorType.changeover,
                                source_layout,
                                current_widget
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
        (dragging_item: LayoutItemEntry, is_save: boolean) => {
            const { x, y } = offsetXYFromLayout(dragging_item.getRef()!);
            const postion = dragging_item.descriptor.pos;
            const placeholder = {
                ...postion,
                x,
                y
            };

            const new_layout = layout.concat(placeholder);

            placeholder.type === WidgetType.grid && snapToGrid(placeholder);
            compact(new_layout);

            setShadowWidget(is_save ? undefined : placeholder);

            return copyObject(new_layout);
        },
        [layout, grid]
    );

    const handlerDraggingItemOut = useCallback(
        (dragging_item?: LayoutItemEntry) => {
            setShadowWidget(undefined);
            const filter_layout = dragging_item
                ? getFilterLayout(dragging_item.descriptor.pos)
                : layout;
            compact(filter_layout);
            setLayout(filter_layout);
            return filter_layout;
        },
        [layout, getFilterLayout]
    );

    const descriptor: LayoutDescriptor = useMemo(
        () => ({
            id: props.layout_id,
            type: props.layout_type,
            mode: props.mode,
            is_root: !is_child_layout
        }),
        [props.layout_id, props.layout_type, props.mode, is_child_layout]
    );

    const getRef = useCallback(() => canvas_ref.current, []);
    const getViewPortRef = useCallback(() => canvas_viewport_ref.current, []);

    const entry: LayoutEntry = useMemo(
        () => ({
            compactLayoutByDraggingItem,
            handlerDraggingItemOut,
            descriptor,
            getRef,
            getViewPortRef,
            unique_id: layout_name,
            is_droppable: props.is_droppable
        }),
        [
            compactLayoutByDraggingItem,
            handlerDraggingItemOut,
            getRef,
            getViewPortRef,
            descriptor,
            layout_name,
            props.is_droppable
        ]
    );

    useLayoutEffect(() => {
        registry.droppable.register(entry);
        return () => registry.droppable.unregister(entry);
    }, [registry, entry]);

    useEffect(() => {
        canvas_ref.current?.addEventListener('click', onClick);
        return () => {
            canvas_ref.current?.removeEventListener('click', onClick);
        };
    }, [onClick]);

    const canvas_width =
        props.layout_type === LayoutType.GRID ? '100%' : props.width;

    useEffect(() => {
        grid_lines_ref.current &&
            drawGridLines(
                grid_lines_ref.current,
                current_width,
                current_height
            );
    }, [current_width, current_height, grid_lines_ref.current]);

    return (
        <div
            id={'react-layout'}
            className={classNames(styles.container, props.className)}
            ref={container_ref}
            style={{
                userSelect: props.mode === LayoutMode.edit ? 'none' : 'auto',
                WebkitUserSelect:
                    props.mode === LayoutMode.edit ? 'none' : 'auto',
                MozUserSelect: props.mode === LayoutMode.edit ? 'none' : 'auto'
            }}
        >
            {/* 水平标尺 */}
            {canvas_viewport_ref.current && props.need_ruler && (
                <HorizontalRuler
                    {...props}
                    width={current_width}
                    l_offset={l_offset!}
                    wrapper_width={wrapper_width}
                    setRulerHoverPos={setRulerHoverPos}
                    canvas_viewport_ref={canvas_viewport_ref}
                ></HorizontalRuler>
            )}

            <div
                style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
                ref={flex_container_ref}
            >
                {/* 垂直标尺 */}
                {canvas_viewport_ref.current && props.need_ruler && (
                    <VerticalRuler
                        {...props}
                        height={current_height}
                        t_offset={t_offset!}
                        wrapper_height={wrapper_height}
                        setRulerHoverPos={setRulerHoverPos}
                        canvas_viewport_ref={canvas_viewport_ref}
                    ></VerticalRuler>
                )}

                {/* 可视区域窗口 */}
                <div
                    ref={canvas_viewport_ref}
                    className={'canvas_viewport'}
                    style={{
                        overflow: 'auto',
                        position: 'relative',
                        flex: 1,
                        scrollBehavior: 'smooth'
                    }}
                >
                    {/* 画板区域 */}
                    <div
                        ref={canvas_wrapper_ref}
                        style={{
                            width:
                                props.layout_type === LayoutType.GRID
                                    ? '100%'
                                    : wrapper_width,
                            height: wrapper_height
                        }}
                        /** 阻止了onDragOver以后，onDrop事件才生效 */
                        onDrop={
                            props.mode === LayoutMode.edit && props.is_droppable
                                ? onDrop
                                : noop
                        }
                        onDragOver={
                            props.mode === LayoutMode.edit && props.is_droppable
                                ? onDragOver
                                : noop
                        }
                        onDragLeave={
                            props.mode === LayoutMode.edit ? onDragLeave : noop
                        }
                    >
                        {/* 实际画布区域 */}
                        <div
                            id={layout_name}
                            ref={canvas_ref}
                            className={styles.canvas}
                            style={{
                                ...props.style,
                                width: canvas_width,
                                height: current_height,
                                top: t_offset,
                                left: l_offset,
                                position: 'relative',
                                overflow:
                                    props.mode === LayoutMode.edit
                                        ? 'unset'
                                        : 'hidden',
                                ...(is_child_layout
                                    ? {}
                                    : {
                                          transform: `scale(${props.scale})`,
                                          transformOrigin: '0 0'
                                      })
                            }}
                        >
                            {/* 网格线 */}
                            {props.mode === LayoutMode.edit &&
                                props.need_grid_lines && (
                                    <canvas
                                        width={current_width}
                                        height={current_height}
                                        ref={grid_lines_ref}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            top: 0,
                                            left: 0,
                                            position: 'absolute',
                                            pointerEvents: 'none'
                                        }}
                                    ></canvas>
                                )}
                            {shadowGridItem()}
                            {React.Children.map(
                                props.children,
                                (child, idx) => {
                                    const widget = layout?.[idx];
                                    return processGridItem(widget, child);
                                }
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {props.mode === LayoutMode.edit && canvas_viewport_ref.current && (
                <GuideLine
                    scale={props.scale}
                    t_offset={t_offset}
                    l_offset={l_offset}
                    guide_lines={props.guide_lines}
                    canvas_viewport_ref={canvas_viewport_ref}
                    ruler_hover_pos={ruler_hover_pos}
                    removeGuideLine={props.removeGuideLine}
                ></GuideLine>
            )}
        </div>
    );
};

ReactLayout.displayName = 'ReactLayout';

ReactLayout.defaultProps = {
    scale: 1,
    cols: 10,
    width: 400,
    height: 400,
    row_height: 20,
    container_padding: [0] as [number],
    item_margin: [0, 0],
    mode: LayoutMode.view,
    need_ruler: false,
    guide_lines: [],
    need_grid_lines: false,
    need_grid_bound: true,
    need_drag_bound: true
};

export default memo(ReactLayout, compareProps);

function compareProps<T>(prev: Readonly<T>, next: Readonly<T>): boolean {
    return !Object.keys(prev)
        .map((key) => {
            if (
                [
                    'drag_item',
                    'getResponders',
                    'onDrop',
                    'onDragStart',
                    'onDrag',
                    'onDragStop',
                    'onResizeStart',
                    'onResize',
                    'onResizeStop',
                    'removeGuideLine',
                    'addGuideLine',
                    'onPositionChange',
                    'onChange'
                ].includes(key)
            ) {
                return true;
            } else {
                return isEqual(prev[key], next[key]);
            }
        })
        .some((state) => state === false);
}
