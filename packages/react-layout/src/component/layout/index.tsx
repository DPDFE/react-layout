import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    memo,
    useContext
} from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import WidgetItem from './canvas/layout-item';
import {
    compact,
    moveElement,
    cloneWidget,
    moveToWidget,
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
    ReactLayoutProps,
    GridType,
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
import Droppable from './context/droppable';
import { END_OPERATOR, START_OPERATOR, CHANGE_OPERATOR } from './constants';

const ReactLayout = (props: ReactLayoutProps) => {
    const {
        checked_index,
        setCurrentChecked,
        operator_type,
        registry,
        start_droppable,
        moving_droppable,
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
     * 根据children信息生成layout
     */
    useEffect(() => {
        if (props.children) {
            const new_layout = React.Children.toArray(props.children).map(
                (child: React.ReactElement) => {
                    const item = child.props['data-drag'] as LayoutItem;
                    ensureWidgetModelValid(item);
                    getBoundResult(item);
                    return addPersonalValue(item);
                }
            );
            compact(new_layout);
            setLayout(new_layout);
        }
    }, [props.children]);

    /**
     * 获取drop元素
     */
    const getDropItem = (e: React.MouseEvent): ItemPos => {
        const { scale, layout_type } = props;

        const current = canvas_ref.current!;
        const { left, top } = current.getBoundingClientRect();

        const responders = getResponders();
        const drop_item = responders.getDroppingItem?.();

        return {
            ...drop_item,
            ...(layout_type === LayoutType.GRID
                ? {
                      w: grid.col_width * (drop_item?.w ?? 2),
                      h: grid.row_height * (drop_item?.h ?? 2)
                  }
                : {
                      w: drop_item ? drop_item.w : 100,
                      h: drop_item ? drop_item.h : 100
                  }),
            i: drop_item ? drop_item.i : '__dropping_item__',
            x: (e.clientX + current.scrollLeft - left) / scale,
            y: (e.clientY + current.scrollTop - top) / scale,
            type:
                layout_type === LayoutType.GRID
                    ? WidgetType.grid
                    : WidgetType.drag
        };
    };

    // 处理拖拽添加，元素移除边界的情况
    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // const pre_layout = registry.droppable.getById(props.layout_id);
        // pre_layout.handlerDraggingItemOut();
    };

    const onDragOver = (e: React.MouseEvent) => {
        const current_widget = getDropItem(e);
        handleResponder(e, OperatorType.drop, current_widget, current_widget);
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        const current_widget = getDropItem(e);
        handleResponder(
            e,
            OperatorType.dropover,
            current_widget,
            current_widget
        );
        // setOperatorType(OperatorType.dropover);
        // if (shadow_widget) {
        //     const item = handleResponder(
        //         OperatorType.dropover,
        //         removePersonalValue(layout),
        //         shadow_widget
        //     );
        //     setShadowWidget(undefined);
        //     compact(layout);
        //     setLayout(layout);
        //     if (item && item.i) {
        //         setCurrentChecked(item.i);
        //     }
        // }
    };

    /**
     * 返回值
     * @returns
     */
    const handleResponder = (
        e: MouseEvent | React.MouseEvent,
        operator: OperatorType,
        current_widget: LayoutItem,
        item_pos: ItemPos
    ) => {
        e.preventDefault();
        e.stopPropagation();
        operator_type.current = operator;

        let result = {};

        if (START_OPERATOR.includes(operator)) {
            setCurrentChecked(item_pos.i);
        }
        if (CHANGE_OPERATOR.includes(operator)) {
            current_widget.is_dragging = true;
            result = getCurrentCoveredLayout(current_widget, item_pos, e);
        }
        if (END_OPERATOR.includes(operator)) {
            setCurrentChecked(undefined);
            current_widget.is_dragging = false;
            result = getCurrentCoveredLayout(current_widget, item_pos, e);

            start_droppable.current = undefined;
            moving_droppable.current = undefined;
        }

        const data = {
            type: operator,
            widget_id: item_pos.i,
            ...result
        };
        const responders = getResponders();
        switch (operator) {
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
            // // drop 事件需要return回调值
            // case OperatorType.drop:
            //     return responders.onDrop?.({ ...data });
            case OperatorType.drag:
                responders.onDrag?.(data);
                break;
            case OperatorType.dragover:
                responders.onDragStop?.(data);
                break;
            case OperatorType.changeover:
                responders.onPositionChange?.(data);
                break;
        }

        if (END_OPERATOR.includes(operator)) {
            responders.onChange?.(data);
        }
    };

    const getFilterLayoutById = useCallback(
        (i) => {
            return layout!.filter((l) => {
                return l.i !== i;
            });
        },
        [layout]
    );

    /**
     * 获取当前鼠标覆盖的布局
     * @param e
     */
    const getCurrentCoveredLayout = (
        widget: LayoutItem,
        item_pos: ItemPos,
        e: MouseEvent | React.MouseEvent
    ) => {
        const covered_layouts = registry.droppable.getAll().filter((entry) => {
            const layout_ref = entry.getViewPortRef();
            if (layout_ref) {
                const { left, top, width, height } =
                    layout_ref.getBoundingClientRect();
                return (
                    clamp(e.clientX, left, left + width) === e.clientX &&
                    clamp(e.clientY, top, top + height) === e.clientY
                );
            }
            return false;
        });

        // 按照布局渲染的顺序，渲染层级越后的元素层级越高，注册时间越晚
        const covered_layout =
            covered_layouts.length > 0
                ? covered_layouts[covered_layouts.length - 1]
                : registry.droppable.getFirstRegister();

        if (covered_layout.id !== moving_droppable.current?.id) {
            // 删除旧布局元素的影子
            if (moving_droppable.current) {
                registry.droppable
                    .getById(moving_droppable.current.id)
                    .deleteShadow(widget);
            }
        }

        moving_droppable.current = covered_layout;

        // 初始布局赋值
        if (!start_droppable.current && covered_layout) {
            start_droppable.current = covered_layout;
        }

        if (moving_droppable.current && start_droppable.current) {
            // 移动到位
            registry.droppable
                .getById(start_droppable.current.id)
                .move(widget, item_pos);

            // 计算定位
            return registry.droppable
                .getById(moving_droppable.current.id)
                .addShadow(widget);
        }
    };

    const getRef = useCallback(() => canvas_ref.current, [canvas_ref.current]);

    const getViewPortRef = useCallback(
        () => canvas_viewport_ref.current,
        [canvas_viewport_ref.current]
    );

    const getCurrentLayout = useCallback(() => layout, [layout]);

    /**
     * 移动
     * 直接修改了layout的内容，rerender 让重新渲染
     */
    const move = useCallback(
        (current_widget: LayoutItem, item_pos: ItemPos) => {
            moveToWidget(current_widget, item_pos);
            setLayout([...layout]);
        },
        [layout]
    );

    /**
     * 删除阴影
     */
    const deleteShadow = useCallback(
        (current_widget) => {
            setShadowWidget(undefined);
            const filter_layout = getFilterLayoutById(current_widget.i);
            compact(filter_layout);
            setLayout([...layout]);

            return filter_layout;
        },
        [layout, getFilterLayoutById]
    );

    /**
     * 定位
     */
    const addShadow = useCallback(
        (current_widget: LayoutItem) => {
            const shadow_widget = cloneWidget(current_widget);
            const filter_layout = getFilterLayoutById(current_widget.i);
            if (current_widget.type === WidgetType.grid) {
                if (
                    moving_droppable.current?.id !== start_droppable.current?.id
                ) {
                    /**
                     * 画布元素相对于实际画布[0,0]进行坐标变换，不针对视窗变化处理
                     */
                    const moving_pos = (
                        moving_droppable.current?.getViewPortRef()
                            ?.firstChild as HTMLElement
                    ).getBoundingClientRect();
                    const start_pos = (
                        start_droppable.current?.getViewPortRef()
                            ?.firstChild as HTMLElement
                    ).getBoundingClientRect();

                    if (start_pos && moving_pos) {
                        shadow_widget.x -= moving_pos.left - start_pos.left;
                        shadow_widget.y -= moving_pos.top - start_pos.top;
                    }
                }

                snapToGrid(shadow_widget);

                const { max_x, min_x, max_y, min_y } = getCurrentBound(
                    current_widget.type
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

                compact([shadow_widget].concat(filter_layout));

                setShadowWidget(shadow_widget);
            }
            if (start_droppable.current!.id === moving_droppable.current!.id) {
                return {
                    source: {
                        layout_id: moving_droppable.current!.id,
                        widgets: [shadow_widget].concat(filter_layout)
                    },
                    destination: undefined
                };
            } else {
                return {
                    source: {
                        layout_id: start_droppable.current!.id,
                        widgets:
                            start_droppable.current!.deleteShadow(shadow_widget)
                    },
                    destination: {
                        layout_id: moving_droppable.current!.id,
                        widgets: [shadow_widget].concat(filter_layout)
                    }
                };
            }
        },
        [layout, grid]
    );

    useEffect(() => {
        const instance = new Droppable({
            id: layout_name,
            is_droppable: props.is_droppable,
            getRef,
            getViewPortRef,
            getCurrentLayout,
            deleteShadow,
            addShadow,
            move
        });

        registry.droppable.register(instance);
        return () => registry.droppable.unregister(instance);
    }, [
        getRef,
        getViewPortRef,
        getCurrentLayout,
        deleteShadow,
        addShadow,
        move
    ]);

    /**
     * @description 当操作结束以后更新操作状态为undefined
     */
    useEffect(() => {
        if (
            operator_type.current &&
            END_OPERATOR.includes(operator_type.current)
        ) {
            operator_type.current = undefined;
        }
    }, [operator_type.current]);

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

    /**
     * shadow dom
     * @returns
     */
    const shadowGridItem = () => {
        return (
            shadow_widget && (
                <WidgetItem
                    {...snapToDrag(shadow_widget)}
                    key='shadow'
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
                    canvas_viewport_ref={canvas_viewport_ref}
                >
                    <div
                        className={`react-drag-placeholder ${styles.placeholder}`}
                    ></div>
                </WidgetItem>
            )
        );
    };

    /**
     * widget dom
     * @param child
     * @param widget
     * @returns
     */
    const processGridItem = (
        child: React.ReactElement,
        widget?: LayoutItem
    ) => {
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
                    is_child_layout={is_child_layout}
                    mode={props.mode}
                    children={child}
                    scale={props.scale}
                    cursors={(props as EditLayoutProps).cursors}
                    is_checked={checked_index === widget.i}
                    is_resizable={
                        widget.is_resizable && checked_index === widget.i
                    }
                    is_sticky={widget.is_sticky}
                    canvas_viewport_ref={canvas_viewport_ref}
                    setCurrentChecked={
                        props.mode === LayoutMode.edit
                            ? setCurrentChecked
                            : noop
                    }
                    onDragStart={(e) => {
                        handleResponder(
                            e,
                            OperatorType.dragstart,
                            widget,
                            widget
                        );
                    }}
                    onDrag={(item, e) => {
                        if (checked_index === widget.i) {
                            handleResponder(e, OperatorType.drag, widget, item);
                        }
                    }}
                    onDragStop={(item, e) => {
                        if (
                            checked_index === widget.i &&
                            operator_type.current === OperatorType.drag
                        ) {
                            handleResponder(
                                e,
                                OperatorType.dragover,
                                widget,
                                item
                            );
                        }
                    }}
                    onResizeStart={(e) => {
                        if (checked_index === widget.i) {
                            handleResponder(
                                e,
                                OperatorType.resizestart,
                                widget,
                                widget
                            );
                        }
                    }}
                    onResize={(item, e) => {
                        if (checked_index === widget.i) {
                            handleResponder(
                                e,
                                OperatorType.resize,
                                widget,
                                item
                            );
                        }
                    }}
                    onResizeStop={(item, e) => {
                        if (checked_index === widget.i) {
                            handleResponder(
                                e,
                                OperatorType.resizeover,
                                widget,
                                item
                            );
                        }
                    }}
                    onPositionChange={(item, e) => {
                        if (checked_index === widget.i) {
                            handleResponder(
                                e,
                                OperatorType.changeover,
                                widget,
                                item
                            );
                        }
                    }}
                />
            );
        } else {
            console.warn(
                `child.key:${child.key} 没有找到对应的布局信息，请保证child.key === widget.i`
            );
            return (
                <div key={(child.key ?? '').toString() + Math.random()}></div>
            );
        }
    };

    return (
        <div
            className={classNames(
                'react-layout',
                styles.container,
                props.className
            )}
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
                        /** 只有根节点注册监听释放事件，计算位置按照根节点相对位置计算 */
                        onDrop={
                            props.mode === LayoutMode.edit &&
                            props.is_droppable &&
                            registry.droppable.getFirstRegister()?.id ===
                                layout_name
                                ? onDrop
                                : noop
                        }
                        onDragOver={
                            props.mode === LayoutMode.edit &&
                            props.is_droppable &&
                            registry.droppable.getFirstRegister()?.id ===
                                layout_name
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
                            {layout.length > 0 &&
                                props.children.map((child) => {
                                    // 要保证child key和widget i一致
                                    const widget = layout.find(
                                        (l) => l.i === child.key
                                    );
                                    return processGridItem(child, widget);
                                })}
                        </div>
                    </div>
                </div>
            </div>

            {props.mode === LayoutMode.edit &&
                canvas_viewport_ref.current &&
                ruler_hover_pos && (
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
