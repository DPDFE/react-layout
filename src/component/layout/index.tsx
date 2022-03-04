import React, {
    Fragment,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
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
    getAllCollisions,
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
    RulerPointer
} from '@/interfaces';
import GuideLine from '../guide-line';
import { copyObject, copyObjectArray, noop } from '@/utils/utils';
import { clamp, DEFAULT_BOUND } from '../canvas/draggable';
import { LayoutContext } from '../layout-context';
import { useLayoutHooks } from './hooks';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const {
        checked_index,
        setCurrentChecked,
        setDragItem,
        operator_type,
        setOperatorType
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
        item.w = Math.max(item.min_w ?? 1, item.w);
        item.h = Math.max(item.min_h ?? 1, item.h);

        item.is_float = item.is_float ?? false;
        item.is_draggable = item.is_draggable ?? false;
        item.is_resizable = item.is_resizable ?? false;
        item.is_nested = item.is_nested ?? false;
        item.covered = item.covered ?? false;
        item.is_dragging = item.is_dragging ?? false;
        item.is_checked = item.is_checked ?? false;
        item.moved = item.moved ?? false;

        return getBoundResult(item);
    }

    /**
     * 根据children信息生成layout
     */
    useEffect(() => {
        const new_layout = React.Children.toArray(props.children).map(
            (child: React.ReactElement) => {
                const item = copyObject(child.props['data-drag']) as LayoutItem;
                return getCurrentWidget(item);
            }
        );
        compact(new_layout);
        setLayout(new_layout);
    }, [props.children, grid, padding]);

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
            compact(layout ?? []);
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
        setOperatorType(OperatorType.drop);

        const collides = getCurrentMouseOverWidget(
            layout!,
            canvas_ref,
            e,
            props.scale
        );

        if (collides && collides.is_nested) {
            setShadowWidget(undefined);
            setOldShadowWidget(undefined);
            compact(layout ?? []);
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
            setOldShadowWidget(copyObject(shadow_widget));

            const new_layout = [shadow_widget, ...layout!];
            compact(new_layout ?? []);
            setLayout(layout);
        }
    };

    /** 如果当前元素位于嵌套元素中 */
    const hasItemUnhoverable = (item: ItemPos, is_save?: boolean) => {
        // if (type === OperatorType.drag || type === OperatorType.dragover) {
        //     const collides = getFirstCollision(layout ?? [], item);
        //     if (collides && collides.is_nested) {
        //         return hasItemUnhoverable(item, is_save);
        //     }
        // }

        const current_item = getLayoutItem(item);
        const float_item = Object.assign({}, current_item, item);

        setShadowWidget(undefined);
        setOldShadowWidget(undefined);
        compact(
            (layout ?? []).filter((l) => {
                return l.i != item.i;
            })
        );
        setLayout(
            layout!.map((w) => {
                return w.i === item.i && !is_save ? float_item : w;
            })
        );
        return layout ?? [];
    };

    /**
     * iframe 会阻止mousemove事件在拖拽过程中处理一下
     */
    const preventIframeMouseEvent = (type: OperatorType, item: ItemPos) => {
        if (OperatorType.drag == type) {
            const collisions = getAllCollisions(layout ?? [], item);
            collisions.map((collision) => {
                collision.covered = true;
            });
        }
        if (OperatorType.resize == type) {
            const collision = getLayoutItem(item);
            collision.covered = true;
        }
        if ([OperatorType.dragover, OperatorType.resizeover].includes(type)) {
            (layout ?? []).map((l) => {
                l.covered = false;
            });
        }
    };

    const getLayoutItem = (item: ItemPos) => {
        return layout!.find((l) => {
            return l.i == item.i;
        }) as LayoutItem;
    };

    const getFilterLayout = (item: ItemPos) => {
        return layout!.filter((l) => {
            return l.i !== item.i;
        });
    };

    const getCurrentLayoutByItem = (
        type: OperatorType,
        item: ItemPos,
        is_save?: boolean
    ) => {
        setOperatorType(type);
        const current_widget = getLayoutItem(item);

        moveToWidget(current_widget, item);

        if (current_widget.is_float) {
            setLayout(copyObject(layout));
            return layout;
        } else {
            const shadow_widget = copyObject(current_widget);
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

            setLayout(copyObject(layout));
            return replaceWidget(layout, shadow_widget);
        }
    };

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
                                        : 'hidden'
                            }}
                            // onContextMenu={(e) => {
                            //     e.preventDefault();
                            // }}
                        >
                            {shadow_widget && (
                                <WidgetItem
                                    ref={shadow_widget_ref}
                                    {...shadow_widget}
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
                                    is_checked={false}
                                >
                                    <div
                                        className={`react-drag-placeholder ${styles.placeholder}`}
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
                                                    props.mode ===
                                                    LayoutType.edit
                                                        ? setCurrentChecked
                                                        : noop
                                                }
                                                onDragStart={() => {
                                                    if (
                                                        checked_index ===
                                                        widget.i
                                                    ) {
                                                        (
                                                            props as EditLayoutProps
                                                        ).onDragStart?.();
                                                    }
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
                                                        ).onDrag?.(
                                                            layout ?? []
                                                        );
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
                                                        ).onDragStop?.(
                                                            layout ?? []
                                                        );
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
                                                        ).onResize?.(
                                                            layout ?? []
                                                        );
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
                                                            layout ?? []
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
                                                            layout ?? []
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
