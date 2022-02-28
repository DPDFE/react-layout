import React, {
    Fragment,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import WidgetItem from '../canvas/layout-item';
import {
    compact,
    formatLayoutItem,
    dynamicProgramming,
    getDropItem,
    moveElement,
    snapToGrid,
    getCurrentMouseOverWidget,
    getFirstCollision
} from './calc';
import styles from './styles.module.css';
import {
    EditLayoutProps,
    ItemPos,
    LayoutItem,
    LayoutType,
    OperatorType,
    ReactDragLayoutProps,
    RulerPointer
} from '@/interfaces';
import GuideLine from '../guide-line';
import { copyObject, copyObjectArray, noop } from '@/utils/utils';
import { clamp, DEFAULT_BOUND } from '../canvas/draggable';
import { LayoutContext } from './context';
import { useLayoutHooks } from './hooks';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const { checked_index, setCurrentChecked } = useContext(LayoutContext);

    const container_ref = useRef<HTMLDivElement>(null);
    const canvas_viewport = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_widget_ref = useRef<HTMLDivElement>(null);

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [shadow_widget, setShadowWidget] = useState<ItemPos>();
    const [old_shadow_widget, setOldShadowWidget] = useState<ItemPos>();

    const [layout, setLayout] = useState<LayoutItem[]>(); // 真实定位位置

    const [operator_type, setOperatorType] = useState<OperatorType>();

    const {
        current_width,
        padding,
        grid,
        bound,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset
    } = useLayoutHooks(props, container_ref, shadow_widget, layout);

    const layout_name = useMemo(() => {
        return `Layout_name_${(Math.random() * 100).toFixed(0)}`;
    }, []);

    /** 根据类型配置计算边界状态 */
    const getCurrentBound = (is_float: boolean) => {
        if (is_float) {
            return props.need_drag_bound ? bound : DEFAULT_BOUND;
        } else {
            return props.need_grid_bound ? bound : DEFAULT_BOUND;
        }
    };

    /**
     * 获取组件实际宽高
     * 组件信息补全
     */
    function getCurrentWidget(item: LayoutItem) {
        /** 初始化前先边界控制一下 */
        const genWidgetPosition = (item: LayoutItem) => {
            const { max_x, min_x, max_y, min_y } = getCurrentBound(
                item.is_float
            );

            const margin_height = item.is_float ? 0 : props.item_margin[0];
            const margin_width = item.is_float ? 0 : props.item_margin[1];

            const offset_x = Math.max(margin_width - padding.left, 0);
            const offset_y = Math.max(margin_height - padding.top, 0);

            const w = Math.max(item.w - margin_width, 0);
            const h = Math.max(item.h - margin_height, 0);

            item.x = clamp(item.x, min_x, max_x - w - offset_x);
            item.y = clamp(item.y, min_y, max_y - h - offset_y);

            return item;
        };

        item.is_float = item.is_float ?? false;
        item.is_draggable = item.is_draggable ?? false;
        item.is_resizable = item.is_resizable ?? false;
        item.is_unhoverable = item.is_unhoverable ?? false;

        if (item.is_float) {
            return genWidgetPosition(item);
        } else {
            const { col_width, row_height } = grid;
            return genWidgetPosition({
                ...item,
                x: item.x * col_width,
                y: item.y * row_height,
                w: item.w * col_width,
                h: item.h * row_height
            });
        }
    }

    /**
     * 根据children信息生成layout
     */
    useEffect(() => {
        const new_layout = React.Children.toArray(props.children).map(
            (child: React.ReactElement) => {
                const item = child.props['data-drag'] as LayoutItem;
                return getCurrentWidget(item);
            }
        );

        compact(new_layout, grid.row_height);
        setLayout(new_layout);
    }, [props.children, grid, bound, padding]);

    /**
     * 让阴影定位组件位于可视范围内
     */
    useLayoutEffect(() => {
        /** 判断元素是否消失 */
        const intersectionObserverInstance = new IntersectionObserver(
            (entries) => {
                entries.map(() => {
                    if (operator_type === OperatorType.resize) {
                        return;
                    }
                    if (props.is_nested) {
                        return;
                    }
                    shadow_widget_ref.current?.scrollIntoView({
                        block: 'nearest',
                        inline: 'nearest'
                    });
                });
            },
            { root: canvas_viewport.current, threshold: 0 }
        );

        shadow_widget &&
            shadow_widget_ref.current &&
            intersectionObserverInstance.observe(shadow_widget_ref.current);
        return () => {
            shadow_widget &&
                shadow_widget_ref.current &&
                intersectionObserverInstance.unobserve(
                    shadow_widget_ref.current
                );
        };
    }, [JSON.stringify(shadow_widget)]);

    /**
     * @description 只有在无状态的情况下，点击空白处才会取消选中状态
     */
    const onClick = (e: React.MouseEvent) => {
        if (operator_type === undefined) {
            e.stopPropagation();
            setCurrentChecked(undefined);
        }
    };

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

    const onDragEnter = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    /** 处理拖拽出画布外没有隐藏shadow的情况 */
    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!canvas_ref.current!.contains(e.relatedTarget as Node)) {
            // 如果是canvas内的子节点会被触发leave
            setShadowWidget(undefined);
            setOldShadowWidget(undefined);
            compact(layout!, grid.row_height);
            setLayout(layout);
        }
    };

    const dragToGridLayout = (layout: LayoutItem[]) => {
        return layout.map((w) => {
            return formatLayoutItem(w, grid);
        });
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setOperatorType(OperatorType.dropover);

        if (shadow_widget) {
            const grid_item = formatLayoutItem(shadow_widget!, grid);
            const item = (props as EditLayoutProps).onDrop?.(
                dragToGridLayout(layout ?? []),
                grid_item
            );

            setShadowWidget(undefined);
            setOldShadowWidget(undefined);

            if (item && item.i) {
                setCurrentChecked(item.i);
            }
        }
    };

    /** 对drop节点做边界计算以后再排序 */
    const formatDropItemBound = (pos: LayoutItem) => {
        const { min_x, min_y } = getCurrentBound(
            props.layout_type === LayoutType.GRID ? false : true
        );

        pos.x = clamp(
            pos.x,
            min_x,
            current_width - pos.w - props.item_margin[0]
        );
        pos.y = clamp(
            pos.y,
            min_y,
            current_height - pos.h - props.item_margin[1]
        );

        return pos;
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();
        setOperatorType(OperatorType.drop);

        const collides = getCurrentMouseOverWidget(
            layout!,
            canvas_ref,
            e,
            props.scale
        );

        if (collides && collides.is_unhoverable) {
            setShadowWidget(undefined);
            setOldShadowWidget(undefined);
            compact(layout!, grid.row_height);
            setLayout(layout);
        } else {
            const drop_item = formatDropItemBound(
                getDropItem(canvas_ref, e, props, grid)
            );

            if (
                old_shadow_widget &&
                drop_item.x === old_shadow_widget.x &&
                drop_item.y === old_shadow_widget.y
            ) {
                return;
            }
            setShadowWidget(drop_item);
            setOldShadowWidget(copyObject(drop_item));

            const new_layout = [drop_item, ...layout!];
            compact(new_layout!, grid.row_height);
            // 排序新布局，保存旧布局
            setLayout(layout);
        }
    };

    /**
     * @author super-hui
     * @param item 添加节点
     * @param is_save 是否需要保存
     * @returns
     */
    const moveLayoutV1 = (item: ItemPos, is_save?: boolean) => {
        const { layout: dynamic_layout, shadow_pos } = dynamicProgramming(
            item,
            layout!,
            grid,
            props.item_margin
        );

        setShadowWidget(is_save || item.is_float ? undefined : shadow_pos);

        const new_layout = dynamic_layout.map((widget: LayoutItem) => {
            return widget.i === item.i
                ? Object.assign(
                      {},
                      widget,
                      is_save && !item.is_float ? shadow_pos : item
                  )
                : widget;
        });

        setLayout(new_layout);

        return dragToGridLayout(new_layout);
    };

    const getLayoutItem = (item: ItemPos) => {
        return layout!.find((l) => {
            return l.i == item.i;
        }) as LayoutItem;
    };

    const moveLayoutV2 = (
        type: OperatorType,
        item: ItemPos,
        is_save?: boolean
    ) => {
        const current_item = getLayoutItem(item);
        const float_item = Object.assign({}, current_item, item);

        if (type === OperatorType.drag || type === OperatorType.dragover) {
            const collides = getFirstCollision(layout ?? [], item);
            if (collides && collides.is_unhoverable) {
                setShadowWidget(undefined);
                setOldShadowWidget(undefined);
                compact(
                    (layout ?? []).filter((l) => {
                        return l.i != item.i;
                    }),
                    grid.row_height
                );
                setLayout(
                    layout!.map((w) => {
                        return w.i === item.i && !is_save ? float_item : w;
                    })
                );
                return dragToGridLayout(layout ?? []);
            }
        }

        Object.assign(current_item, item);
        const old_layout = copyObjectArray(layout ?? []);

        if (current_item.is_float) {
            setLayout(old_layout);
            return dragToGridLayout(old_layout ?? []);
        } else {
            snapToGrid(item, grid);

            moveElement(
                layout!,
                current_item,
                item.x,
                item.y,
                grid.row_height,
                true
            );

            current_item.w = item.w;
            current_item.h = item.h;

            compact(layout!, grid.row_height);

            if (is_save) {
                setShadowWidget(undefined);
                setLayout(layout);
                return dragToGridLayout(layout ?? []);
            } else {
                setShadowWidget(current_item);
                setLayout(old_layout);
                return dragToGridLayout(old_layout ?? []);
            }
        }
    };

    const getCurrentLayoutByItem = (
        type: OperatorType,
        item: ItemPos,
        is_save?: boolean
    ) => {
        setOperatorType(type);
        // return moveLayoutV1(item, is_save);
        return moveLayoutV2(type, item, is_save);
    };

    return (
        <div
            className={`react-drag-layout ${styles.container}`}
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

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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

                {/* 可视区域窗口 */}
                <div
                    style={{
                        overflowX: props.is_nested ? 'hidden' : 'auto',
                        overflowY: 'auto',
                        position: 'relative',
                        flex: 1,
                        scrollBehavior: 'smooth'
                    }}
                    ref={canvas_viewport}
                    id={'canvas_viewport'}
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
                    >
                        {/* 实际画布区域 */}
                        <div
                            id={layout_name}
                            ref={canvas_ref}
                            className={styles.canvas}
                            style={{
                                width: current_width,
                                height: current_height,
                                top: t_offset,
                                left: l_offset,
                                transform: `scale(${props.scale})`,
                                transformOrigin: '0 0',
                                overflow:
                                    props.mode === LayoutType.edit
                                        ? 'unset'
                                        : 'hidden',
                                paddingTop: padding.top,
                                paddingLeft: padding.left,
                                paddingBottom: padding.bottom,
                                paddingRight: padding.right
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                            }}
                        >
                            {shadow_widget && (
                                <WidgetItem
                                    ref={shadow_widget_ref}
                                    {...shadow_widget}
                                    width={current_width}
                                    height={current_height}
                                    bound={getCurrentBound(
                                        shadow_widget.is_float
                                    )}
                                    padding={padding}
                                    scale={props.scale}
                                    margin={props.item_margin}
                                    grid={grid}
                                    layout_type={props.layout_type}
                                    is_resizable={false}
                                    is_draggable={false}
                                >
                                    <div
                                        className={`placeholder ${styles.placeholder}`}
                                    ></div>
                                </WidgetItem>
                            )}

                            {React.Children.map(
                                props.children,
                                (child, idx) => {
                                    const widget = layout?.[idx];
                                    if (widget) {
                                        return (
                                            <WidgetItem
                                                layout_type={props.layout_type}
                                                key={widget.i}
                                                {...widget}
                                                {...child.props}
                                                padding={padding}
                                                grid={grid}
                                                bound={getCurrentBound(
                                                    widget.is_float
                                                )}
                                                children={child}
                                                width={current_width}
                                                height={current_height}
                                                scale={props.scale}
                                                margin={props.item_margin}
                                                is_checked={
                                                    checked_index === widget.i
                                                }
                                                is_resizable={
                                                    widget.is_resizable &&
                                                    checked_index === widget.i
                                                }
                                                setCurrentChecked={
                                                    setCurrentChecked
                                                }
                                                onDragStart={() => {
                                                    checked_index === widget.i
                                                        ? (
                                                              props as EditLayoutProps
                                                          ).onDragStart?.()
                                                        : noop;
                                                }}
                                                onDrag={(item) => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        const layout =
                                                            getCurrentLayoutByItem(
                                                                OperatorType.drag,
                                                                item,
                                                                false
                                                            );
                                                        (
                                                            props as EditLayoutProps
                                                        ).onDrag?.(layout);
                                                    }
                                                }}
                                                onDragStop={(item) => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        const layout =
                                                            getCurrentLayoutByItem(
                                                                OperatorType.dragover,
                                                                item,
                                                                true
                                                            );
                                                        (
                                                            props as EditLayoutProps
                                                        ).onDragStop?.(layout);
                                                    }
                                                }}
                                                onResizeStart={() => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        (
                                                            props as EditLayoutProps
                                                        ).onResizeStart?.();
                                                    }
                                                }}
                                                onResize={(item) => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        const layout =
                                                            getCurrentLayoutByItem(
                                                                OperatorType.resize,
                                                                item,
                                                                false
                                                            );
                                                        (
                                                            props as EditLayoutProps
                                                        ).onResize?.(layout);
                                                    }
                                                }}
                                                onResizeStop={(item) => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        const layout =
                                                            getCurrentLayoutByItem(
                                                                OperatorType.resizeover,
                                                                item,
                                                                true
                                                            );
                                                        (
                                                            props as EditLayoutProps
                                                        ).onResizeStop?.(
                                                            layout
                                                        );
                                                    }
                                                }}
                                                onPositionChange={(item) => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        const layout =
                                                            getCurrentLayoutByItem(
                                                                OperatorType.changeover,
                                                                item,
                                                                true
                                                            );
                                                        (
                                                            props as EditLayoutProps
                                                        ).onPositionChange?.(
                                                            layout
                                                        );
                                                    }
                                                }}
                                            />
                                        );
                                    } else {
                                        return <Fragment></Fragment>;
                                    }
                                }
                            )}
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
    container_padding: [0],
    item_margin: [0, 0],
    mode: LayoutType.view,
    need_ruler: false,
    need_grid_bound: true,
    need_drag_bound: true,
    is_nested: false
};

export default ReactDragLayout;
