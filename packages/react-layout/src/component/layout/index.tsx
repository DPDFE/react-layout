import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    memo,
    useContext,
    useLayoutEffect,
    useMemo
} from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import WidgetItem from '../canvas/layout-item';
import {
    compact,
    moveElement,
    cloneWidget,
    moveToWidget,
    formatInputValue
} from './context/calc';
import styles from './styles.module.css';
import {
    LayoutMode,
    ItemPos,
    LayoutItem,
    LayoutType,
    OperatorType,
    RulerPointer,
    ReactLayoutProps,
    WidgetType,
    EditLayoutProps,
    Droppable
} from '@/interfaces';
import GuideLine from '../guide-line';
import { copyObject, noop } from '@/utils/utils';
import { clamp, DEFAULT_BOUND } from '../canvas/draggable';
import { useLayoutHooks } from './provider/hooks';
import isEqual from 'lodash.isequal';
import { LayoutContext } from './context';
import drawGridLines from './grid-lines';
import classNames from 'classnames';
import deepClone from 'lodash/cloneDeep';
import {
    END_OPERATOR,
    START_OPERATOR,
    CHANGE_OPERATOR,
    DROP_OPERATOR
} from './constants';

const ReactLayout = (props: ReactLayoutProps) => {
    const {
        checked_index,
        setCurrentChecked,
        operator_type,
        registry,
        start_droppable,
        moving_droppable,
        getResponders,
        drop_enter_counter,
        drag_item,
        placeholder,
        setPlaceHolder
    } = useContext(LayoutContext);

    const container_ref = useRef<HTMLDivElement>(null);
    const canvas_viewport_ref = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper_ref = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动
    const grid_lines_ref = useRef<HTMLCanvasElement>(null); //
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_widget_ref = useRef<HTMLDivElement>(null);

    const [shadow_pos, setShadowPos] = useState<ItemPos>(); //上一时刻阴影的计算结果

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置

    const latest_layout_ref = useRef<LayoutItem[]>(); // 上一次layout init状态

    console.log('index');

    const {
        current_width,
        grid,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset,
        padding,
        boundControl,
        getBoundingSize,
        snapToGrid
    } = useLayoutHooks(
        layout,
        props,
        container_ref,
        canvas_viewport_ref,
        shadow_widget_ref,
        placeholder
    );

    /**
     * @description 只有在无状态的情况下，点击空白处才会取消选中状态
     */
    const onClick = useCallback(
        (e) => {
            if (
                e.target === canvas_ref.current &&
                operator_type.current === undefined
            ) {
                setCurrentChecked(undefined);
            }
        },
        [operator_type]
    );

    /**
     * 根据children信息生成layout
     */
    useEffect(() => {
        if (props.children) {
            const new_layout = React.Children.toArray(props.children).map(
                (child: React.ReactElement) => {
                    return boundControl(
                        formatInputValue(
                            child.props['data-drag'] as LayoutItem,
                            props.layout_id
                        )
                    );
                }
            );

            if (!isEqual(latest_layout_ref.current, new_layout)) {
                new_layout.map((child, index) => {
                    !isEqual(latest_layout_ref.current?.[index], child) &&
                        console.log(latest_layout_ref.current?.[index], child);
                });

                compact(new_layout);
                setLayout(deepClone(new_layout));
                latest_layout_ref.current = new_layout;
            }
            if (!latest_layout_ref.current) {
                latest_layout_ref.current = new_layout;
            }
        }
    }, [props.children]);

    /**
     * 获取drop元素
     */
    const getDropItem = (e: React.MouseEvent) => {
        const { scale, layout_type } = props;

        const current = canvas_ref.current!;
        const { left, top } = current.getBoundingClientRect();

        const responders = getResponders();
        const drop_item = responders.getDroppingItem?.();

        return {
            is_droppable: true,
            is_draggable: true,
            is_resizable: true,
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
                    : WidgetType.drag,
            layout_id: registry.droppable.getFirstRegister()?.id
        };
    };

    /**
     * 返回值
     * @returns
     */
    const handleResponder = (
        e: MouseEvent | React.MouseEvent,
        operator: OperatorType,
        current_widget: LayoutItem,
        item_pos?: ItemPos
    ) => {
        e.preventDefault();
        e.stopPropagation();

        operator_type.current = operator;

        if (START_OPERATOR.includes(operator)) {
            setCurrentChecked(current_widget.i);
        }
        if (CHANGE_OPERATOR.includes(operator)) {
            current_widget.is_dragging = true;
        }

        const data = {
            type: operator,
            widget_id: current_widget.i,
            ...getCurrentCoveredLayout(e, current_widget, item_pos)
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
            case OperatorType.dropover:
                responders.onDrop?.(data);
                break;
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

            moving_droppable.current &&
                registry.droppable
                    .getById(moving_droppable.current.id)
                    .cleanShadow(current_widget);

            start_droppable.current = undefined;
            moving_droppable.current = undefined;
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
        e: MouseEvent | React.MouseEvent,
        widget: LayoutItem,
        item_pos?: ItemPos
    ) => {
        const draggable_ref = registry.draggable.getById(widget.i)?.getRef();

        const covered_layouts = registry.droppable.getAll().filter((entry) => {
            const layout_ref = entry.getViewPortRef();
            if (layout_ref) {
                if (!entry.is_droppable) {
                    return false;
                }
                // 如果是当前元素的子元素，不支持放置
                if (draggable_ref?.contains(layout_ref)) {
                    return false;
                }
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

        // 初始布局赋值
        if (!start_droppable.current) {
            start_droppable.current = registry.droppable.getById(
                widget.layout_id!
            );
            moving_droppable.current = start_droppable.current;
        }

        // 删除旧布局的影子
        if (
            widget.is_droppable &&
            covered_layout.id !== moving_droppable.current?.id
        ) {
            if (moving_droppable.current) {
                registry.droppable
                    .getById(moving_droppable.current.id)
                    .cleanShadow(widget);
            }

            moving_droppable.current = covered_layout;
        }

        if (
            operator_type.current &&
            [OperatorType.resize, OperatorType.resizeover].includes(
                operator_type.current
            )
        ) {
            moving_droppable.current = start_droppable.current;
        }

        if (moving_droppable.current && start_droppable.current) {
            // 移动到位
            registry.droppable
                .getById(start_droppable.current.id)
                .move(widget, item_pos ?? widget);

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

    /**
     * 移动
     * 直接修改了layout的内容，rerender 让重新渲染
     */
    const move = useCallback(
        (current_widget: LayoutItem, item_pos: ItemPos) => {
            moveToWidget(current_widget, item_pos);
            setLayout(
                layout.map((l) =>
                    l.i === current_widget.i ? current_widget : l
                )
            );
        },
        [layout]
    );

    /**
     * 删除阴影
     */
    const cleanShadow = useCallback(
        (current_widget) => {
            setPlaceHolder(undefined);
            const filter_layout = current_widget
                ? getFilterLayoutById(current_widget.i)
                : layout;
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
            const shadow = cloneWidget(current_widget);
            const filter_layout = getFilterLayoutById(current_widget.i);

            const compact_with_mappings = {};

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
                        shadow.x -= moving_pos.left - start_pos.left;
                        shadow.y -= moving_pos.top - start_pos.top;
                    }
                }

                snapToGrid(shadow);
                setShadowPos(cloneWidget(shadow));

                const layout =
                    shadow_pos &&
                    shadow_pos.x == shadow.x &&
                    shadow_pos.y == shadow.y
                        ? filter_layout
                        : moveElement(
                              filter_layout,
                              shadow,
                              shadow.x,
                              shadow.y,
                              true
                          );

                const compact_with = compact([shadow].concat(layout));

                compact_with.map((c) => {
                    compact_with_mappings[c.i] = copyObject(c);
                });
            }

            const new_layout = layout.map((l) => {
                return compact_with_mappings[l.i]
                    ? compact_with_mappings[l.i]
                    : l;
            });

            // 最后保存状态的时候不画shadow
            if (
                operator_type.current &&
                CHANGE_OPERATOR.includes(operator_type.current)
            ) {
                setPlaceHolder(compact_with_mappings[shadow.i]);
            }

            if (
                start_droppable.current!.id === moving_droppable.current!.id &&
                operator_type.current &&
                !DROP_OPERATOR.includes(operator_type.current)
            ) {
                return {
                    source: {
                        layout_id: moving_droppable.current!.id,
                        widgets: new_layout
                    },
                    widget: shadow,
                    destination: undefined
                };
            } else {
                return {
                    source: {
                        layout_id: start_droppable.current!.id,
                        widgets: start_droppable.current!.getFilterLayoutById(
                            shadow.i
                        )
                    },
                    widget: shadow,
                    destination: {
                        layout_id: moving_droppable.current!.id,
                        widgets: [shadow].concat(new_layout)
                    }
                };
            }
        },
        [layout, grid, shadow_pos]
    );

    const entry: Droppable = useMemo(
        () => ({
            id: props.layout_id,
            is_droppable: props.is_droppable,
            getRef,
            getViewPortRef,
            cleanShadow,
            getFilterLayoutById,
            addShadow,
            move
        }),
        [
            getRef,
            getViewPortRef,
            cleanShadow,
            getFilterLayoutById,
            addShadow,
            move
        ]
    );

    useLayoutEffect(() => {
        registry.droppable.register(entry);
        return () => registry.droppable.unregister(entry);
    }, [registry, entry]);

    useEffect(() => {
        if (
            operator_type.current &&
            END_OPERATOR.includes(operator_type.current)
        ) {
            operator_type.current = undefined;
        }
    }, [operator_type.current]);

    useEffect(() => {
        drawGridLines(current_width, current_height, grid_lines_ref.current);
    }, [current_width, current_height]);

    /**
     * 偏移量
     */
    const getMarginSize = {
        [WidgetType.drag]: {
            margin_height: 0,
            margin_width: 0,
            offset_x: 0,
            offset_y: 0
        },
        [WidgetType.grid]: {
            margin_height: props.item_margin[0],
            margin_width: props.item_margin[1],
            offset_x: Math.max(props.item_margin[1], padding.left),
            offset_y: Math.max(props.item_margin[0], padding.top)
        }
    };

    /**
     * shadow dom
     * @returns
     */
    const shadowGridItem = () => {
        return (
            placeholder &&
            moving_droppable.current?.id === props.layout_id && (
                <WidgetItem
                    {...getMarginSize[placeholder.type]}
                    {...DEFAULT_BOUND}
                    {...placeholder}
                    key='shadow'
                    layout_id={props.layout_id}
                    ref={shadow_widget_ref}
                    padding={padding}
                    margin={props.item_margin}
                    is_placeholder={true}
                    bound={getBoundingSize[placeholder.type]}
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
                    {...getMarginSize[widget.type]}
                    {...(widget.is_dragging
                        ? DEFAULT_BOUND
                        : getBoundingSize[widget.type])}
                    // @ts-ignore
                    layout_id={props.layout_id}
                    key={widget.i}
                    {...widget}
                    padding={padding}
                    margin={props.item_margin}
                    {...child.props}
                    grid={grid}
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
                        handleResponder(e, OperatorType.dragstart, widget);
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

    /**
     * 设置选择样式
     * @returns
     */
    const setUserSelect = () => {
        const user_select: 'none' | 'auto' =
            props.mode === LayoutMode.edit ? 'none' : 'auto';
        return {
            UserSelect: user_select,
            WebkitUserSelect: user_select,
            MozUserSelect: user_select
        };
    };

    return (
        <div
            className={classNames(
                'react-layout',
                styles.container,
                props.className
            )}
            ref={container_ref}
            style={setUserSelect()}
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

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
                    /** 阻止了onDragOver以后，onDrop事件才生效 */
                    /** 只有根节点注册监听释放事件，计算位置按照根节点相对位置计算 */
                    onDrop={
                        props.mode === LayoutMode.edit &&
                        props.is_droppable &&
                        registry.droppable.getFirstRegister()?.id ===
                            props.layout_id
                            ? (e) => {
                                  handleResponder(
                                      e,
                                      OperatorType.dropover,
                                      getDropItem(e)
                                  );
                                  drag_item.current = undefined;
                              }
                            : noop
                    }
                    onDragOver={
                        props.mode === LayoutMode.edit &&
                        props.is_droppable &&
                        registry.droppable.getFirstRegister()?.id ===
                            props.layout_id
                            ? (e) => {
                                  e.preventDefault();
                                  const widget = getDropItem(e);
                                  delete drag_item.current?.is_dragging;

                                  if (!drag_item.current) {
                                      handleResponder(
                                          e,
                                          OperatorType.dragstart,
                                          widget
                                      );
                                  }
                                  if (!isEqual(drag_item.current, widget)) {
                                      //  不要开火太多次
                                      handleResponder(
                                          e,
                                          OperatorType.drop,
                                          widget
                                      );
                                  }
                                  drag_item.current = widget;
                              }
                            : noop
                    }
                    onDragEnter={() => {
                        drop_enter_counter.current += 1;
                    }}
                    onDragLeave={
                        props.mode === LayoutMode.edit &&
                        registry.droppable.getFirstRegister()?.id ===
                            props.layout_id
                            ? () => {
                                  drop_enter_counter.current -= 1;

                                  if (drop_enter_counter.current == 0) {
                                      if (moving_droppable.current) {
                                          registry.droppable
                                              .getById(
                                                  moving_droppable.current.id
                                              )
                                              .cleanShadow();
                                      }
                                  }
                              }
                            : noop
                    }
                >
                    {/* 画板区域 */}
                    <div
                        className='canvas_wrapper'
                        ref={canvas_wrapper_ref}
                        style={{
                            width:
                                props.layout_type === LayoutType.GRID
                                    ? '100%'
                                    : wrapper_width,
                            height: wrapper_height
                        }}
                    >
                        {/* 实际画布区域 */}
                        <div
                            id={props.layout_id}
                            ref={canvas_ref}
                            onClick={(e) => {
                                registry.droppable.getFirstRegister()?.id ===
                                    props.layout_id && onClick(e);
                            }}
                            className={styles.canvas}
                            style={{
                                ...props.style,
                                width:
                                    props.layout_type === LayoutType.GRID
                                        ? '100%'
                                        : props.width,
                                height: current_height,
                                top: t_offset,
                                left: l_offset,
                                position: 'relative',
                                overflow:
                                    props.mode === LayoutMode.edit
                                        ? 'unset'
                                        : 'hidden',
                                ...(registry.droppable.getFirstRegister()
                                    ?.id !== props.layout_id
                                    ? {}
                                    : {
                                          transform: `scale(${props.scale})`,
                                          transformOrigin: '0 0'
                                      })
                            }}
                        >
                            {/* 网格线 */}
                            {props.mode === LayoutMode.edit &&
                                registry.droppable.getFirstRegister()?.id ===
                                    props.layout_id &&
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
