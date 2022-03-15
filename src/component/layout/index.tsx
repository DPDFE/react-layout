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
    snapToGrid,
    cloneWidget,
    moveToWidget,
    replaceWidget,
    getDropPosition
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
    WidgetLocation
} from '@/interfaces';
import GuideLine from '../guide-line';
import { copyObject, noop } from '@/utils/utils';
import { clamp, DEFAULT_BOUND } from './canvas/draggable';
import { useLayoutHooks } from './hooks';
import isEqual from 'lodash.isequal';
import { LayoutContext } from './context';

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
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_widget_ref = useRef<HTMLDivElement>(null);
    const flex_container_ref = useRef<HTMLDivElement>(null);

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [shadow_widget, setShadowWidget] = useState<ItemPos>();
    const [last_shadow_widget, setLastShadowWidget] = useState<ItemPos>();

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
        container_ref,
        canvas_viewport_ref,
        shadow_widget_ref,
        shadow_widget,
        operator_type
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
    const onClick = () => {
        if (operator_type === undefined && !props.is_nested_layout) {
            setCurrentChecked(undefined);
        }
    };

    const layout_name = useMemo(() => {
        return `layout_name_${props.layout_id}`;
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
    function ensureWidgetModelValid(item: LayoutItem) {
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
    }

    /**
     * 根据children信息生成layout
     */
    useEffect(() => {
        if (current_width) {
            const new_layout = React.Children.toArray(props.children).map(
                (child: React.ReactElement) => {
                    const item = child.props['data-drag'] as LayoutItem;
                    ensureWidgetModelValid(item);
                    getBoundResult(item);
                    return item;
                }
            );
            compact(new_layout);
            setLayout(new_layout);
        }
    }, [props.children, grid, padding, current_width]);

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOperatorType(OperatorType.dropover);

        if (shadow_widget) {
            const item = handleResponder(
                OperatorType.dropover,
                layout,
                shadow_widget
            );

            setShadowWidget(undefined);
            setLastShadowWidget(undefined);

            if (item && item.i) {
                setCurrentChecked(item.i);
            }
        }
    };

    /** 对drop节点做边界计算以后再排序 */
    const getBoundResult = (item: LayoutItem) => {
        const { max_x, min_x, max_y, min_y } = getCurrentBound(item.is_float);

        item.x = clamp(item.x, min_x, max_x - item.w);
        item.y = clamp(item.y, min_y, max_y - item.h);

        return item;
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

            const pos = { w, h, i, x, y, is_float: false };

            snapToGrid(pos, grid);

            return pos;
        } else {
            const w = drop_item ? drop_item.w : 100;
            const h = drop_item ? drop_item.h : 100;

            return { w, h, i, x, y, is_float: true };
        }
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

    const handleResponder = (
        type: OperatorType,
        layout: LayoutItem[],
        widget: LayoutItem,
        destination?: WidgetLocation
    ) => {
        const data = {
            type,
            widget_id: widget.i,
            source: {
                layout_id: props.layout_id,
                widgets: copyObject(layout)
            }
        };
        setOperatorType(type);
        const responders = getResponders();
        switch (type) {
            case OperatorType.dragstart:
                // 触发onDragStart事件
                responders.onDragStart?.(data);
                break;
            case OperatorType.resizestart:
                responders.onResizeStart?.(data);
                break;
            case OperatorType.resize:
                responders.onResize?.(data);
                break;
            case OperatorType.resizeover:
                responders.onResizeStop?.(data);
                break;
            case OperatorType.dropover:
                return responders.onDrop?.({ ...data, widget });
            // drag、dragover 事件在context/hooks触发
            case OperatorType.drag:
                responders.onDrag?.({ ...data, destination });
                break;
            case OperatorType.dragover:
                responders.onDragStop?.({ ...data, destination });
                break;
            case OperatorType.changeover:
                responders.onPositionChange?.(data);
                break;
        }

        responders.onChange?.({ ...data, destination });

        return widget;
    };

    const getDestinationLayoutByItemId = useCallback(
        (type: OperatorType, widget_id: string, is_save: boolean) => {
            if (
                dragging_layout_id.current &&
                dragging_layout_id.current !== props.layout_id
            ) {
                const droppable = registry.droppable.getById(
                    dragging_layout_id.current
                );
                const dragging_item = registry.draggable.getById(widget_id);
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

                return { widgets, layout_id: dragging_layout_id.current };
            }

            return;
        },
        [registry, props.layout_id, dragging_layout_id]
    );

    const getCurrentLayoutByItem = useCallback(
        (item: ItemPos, is_save?: boolean) => {
            const current_widget = getLayoutItem(item);

            moveToWidget(current_widget, item);

            current_widget.is_dragging = is_save ? false : true;

            // 当前拖拽元素 原Layout 处理元素移除逻辑
            if (
                dragging_layout_id.current &&
                dragging_layout_id.current !== props.layout_id
            ) {
                const filter_layout = getFilterLayout(item);
                setLayout(copyObject(layout));
                compact(filter_layout);
                setShadowWidget(undefined);
                // handleResponder(type, filter_layout, current_widget);
                return { layout: filter_layout, widget: current_widget };
            }

            const shadow_widget = cloneWidget(current_widget);
            if (!current_widget.is_float) {
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
                    moveToWidget(current_widget, shadow_widget);
                    setShadowWidget(undefined);
                } else {
                    setShadowWidget(shadow_widget);
                }
            }
            setLayout(copyObject(layout));

            // handleResponder(
            //     type,
            //     replaceWidget(layout, shadow_widget),
            //     current_widget
            // );

            return {
                layout: replaceWidget(layout, shadow_widget),
                widget: current_widget
            };
        },
        [layout, grid]
    );

    const shadowGridItem = () => {
        return (
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
                    mode={LayoutMode.view}
                    grid={grid}
                    layout_type={props.layout_type}
                    is_resizable={false}
                    is_draggable={false}
                    is_checked={false}
                    in_nested_layout={props.is_nested_layout}
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
                    layout_nested={props.is_nested_layout}
                    mode={props.mode}
                    children={child}
                    scale={props.scale}
                    margin={props.item_margin}
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
                        handleResponder(OperatorType.dragstart, layout, widget);
                    }}
                    onDrag={(item) => {
                        if (checked_index === widget.i) {
                            const {
                                layout: source_layout,
                                widget: current_widget
                            } = getCurrentLayoutByItem(item, false);
                            const destination = getDestinationLayoutByItemId(
                                OperatorType.drag,
                                current_widget.i,
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
                            const destination = getDestinationLayoutByItemId(
                                OperatorType.dragover,
                                current_widget.i,
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
                            } = getCurrentLayoutByItem(item, true);
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
                            // (props as EditLayoutProps).onPositionChange?.(
                            //     layout ?? []
                            // );
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

            !placeholder.is_float && snapToGrid(placeholder, grid);
            compact(new_layout);

            if (!is_save) setShadowWidget(placeholder);

            return copyObject(new_layout);
        },
        [layout]
    );

    const getLayoutStyle = () => {
        const transform = props.is_nested_layout
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
            overflow: props.mode === LayoutMode.edit ? 'unset' : 'hidden',
            ...transform
        };
    };

    const handlerDraggingItemOut = useCallback(
        (dragging_item?: LayoutItemEntry) => {
            setShadowWidget(undefined);
            const filter_layout = dragging_item
                ? getFilterLayout(dragging_item.descriptor.pos)
                : layout;
            compact(filter_layout);
            setLayout(copyObject(layout));
            return copyObject(filter_layout);
        },
        [layout, getFilterLayout]
    );

    const descriptor: LayoutDescriptor = useMemo(
        () => ({
            id: props.layout_id,
            type: props.layout_type,
            mode: props.mode,
            is_root: !props.is_nested_layout
        }),
        [props.layout_id, props.layout_type, props.mode, props.is_nested_layout]
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
            unique_id: layout_name
        }),
        [
            compactLayoutByDraggingItem,
            handlerDraggingItemOut,
            getRef,
            getViewPortRef,
            descriptor,
            layout_name
        ]
    );

    useLayoutEffect(() => {
        registry.droppable.register(entry);
        return () => registry.droppable.unregister(entry);
    }, [registry, entry]);

    return (
        <div
            className={`react-layout ${styles.container} ${props.className}`}
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
                    style={{
                        overflowY: 'auto',
                        position: 'relative',
                        flex: 1,
                        scrollBehavior: 'smooth'
                    }}
                >
                    {/* 画板区域 */}
                    <div
                        ref={canvas_wrapper_ref}
                        style={{
                            width: wrapper_width,
                            height: wrapper_height
                        }}
                        /** 阻止了onDragOver以后，onDrop事件才生效 */
                        onDrop={props.mode === LayoutMode.edit ? onDrop : noop}
                        onDragOver={
                            props.mode === LayoutMode.edit ? onDragOver : noop
                        }
                        onClick={onClick}
                    >
                        {/* 实际画布区域 */}
                        <div
                            id={layout_name}
                            ref={canvas_ref}
                            className={styles.canvas}
                            style={getLayoutStyle()}
                            onMouseOver={(e) => {
                                e.stopPropagation();
                                if (
                                    dragging_layout.current &&
                                    dragging_layout_id.current &&
                                    dragging_layout_id.current !==
                                        props.layout_id
                                ) {
                                    const { layout, drag_item } =
                                        dragging_layout.current;
                                    layout.handlerDraggingItemOut(drag_item);
                                }
                                dragging_layout_id.current = props.layout_id;
                            }}
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

            {/* {props.mode === LayoutMode.edit && canvas_viewport_ref.current && (
                <GuideLine
                    scale={(props as DragLayoutProps).scale}
                    t_offset={t_offset}
                    l_offset={l_offset}
                    guide_lines={props.guide_lines}
                    canvas_viewport_ref={canvas_viewport_ref}
                    ruler_hover_pos={ruler_hover_pos}
                    removeGuideLine={props.removeGuideLine}
                ></GuideLine>
            )} */}
        </div>
    );
};

ReactLayout.defaultProps = {
    scale: 1,
    cols: 10,
    width: 200,
    height: 200,
    row_height: 20,
    container_padding: [0] as [number],
    item_margin: [0, 0],
    mode: LayoutMode.view,
    need_ruler: false,
    need_grid_bound: true,
    need_drag_bound: true,
    is_nested: false
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
