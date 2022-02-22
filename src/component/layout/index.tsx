import React, { Fragment, useEffect, useRef, useState } from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import WidgetItem from '../canvas/layout-item';
import { getMaxWidgetsRange } from './layout-calc';
import styles from './styles.module.css';
import {
    BoundType,
    DragLayoutProps,
    EditLayoutProps,
    GridType,
    ItemPos,
    LayoutItem,
    LayoutType,
    MarginType,
    ReactDragLayoutProps,
    RulerPointer
} from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import GuideLine from '../guide-line';
import { DEFAULT_BOUND } from '../canvas/draggable';
import { noop } from '@/utils/utils';
import {
    compact,
    createInitialLayout,
    dragToGrid,
    dynamicProgramming,
    getDropPos,
    moveElement,
    snapToGrid
} from './canvas-calc';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const container_ref = useRef<HTMLDivElement>(null);
    const canvas_viewport = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动
    const canvas_ref = useRef<HTMLDivElement>(null);

    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [current_width, setCurrentWidth] = useState<number>(0); //宽度
    const [current_height, setCurrentHeight] = useState<number>(0); //高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [grid, setGrid] = useState<GridType>({ col_width: 1, row_height: 1 });
    const [bound, setBound] = useState<BoundType>(DEFAULT_BOUND);
    const [padding, setPadding] = useState<MarginType>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    });

    const [checked_index, setCurrentChecked] = useState<string>();

    const [shadow_widget, setShadowWidget] = useState<ItemPos | undefined>(
        undefined
    );
    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置

    useEffect(() => {
        if (props.children && props.children.length > 0) {
            console.log('init');
            const layout = createInitialLayout(props.children, grid);
            // TODO：应该在compact以后再计算宽高，同时还可以解决实时计算宽高的问题
            compact(layout, grid.row_height);

            setLayout(layout);
        }
    }, [props.children, grid]);

    /** 清空选中 */
    const onClick = (e: React.MouseEvent) => {
        console.log('clearChecked');
        e.stopPropagation();
        setCurrentChecked(undefined);
    };

    /** 处理拖拽出画布外没有隐藏shadow的情况 */
    const onDragLeave = (e: React.MouseEvent) => {
        // 如果是canvas内的子节点会被触发leave
        if (
            !canvas_ref.current!.contains(e.relatedTarget as Node) &&
            !shadow_widget?.is_float
        ) {
            setShadowWidget(undefined);
            compact(layout, grid.row_height);
        }
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const drop_item = getDropPos(canvas_ref, e, props, grid);

        const grid_item = dragToGrid(drop_item, grid);
        const item = (props as EditLayoutProps).onDrop?.(grid_item);

        if (item && item.i) {
            setShadowWidget(undefined);
            setCurrentChecked(item.i);
        }
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const drop_item = getDropPos(canvas_ref, e, props, grid);
        setShadowWidget(drop_item);

        const new_layout = layout.concat(drop_item);
        compact(new_layout, grid.row_height);
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
            layout,
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

        return new_layout.map((w) => {
            return dragToGrid(w, grid);
        });
    };

    const getLayoutItem = (item: ItemPos) => {
        return layout.find((l) => {
            return l.i == item.i;
        }) as LayoutItem;
    };

    const moveLayoutV2 = (item: ItemPos, is_save?: boolean) => {
        const current_item = getLayoutItem(item);
        const float_item = Object.assign({}, current_item, item);

        if (!current_item.is_float) {
            snapToGrid(item, grid);
            moveElement(layout, current_item, item.x, item.y, grid.row_height);
            current_item.w = item.w;
            current_item.h = item.h;
            compact(layout, grid.row_height);
            setShadowWidget(is_save ? undefined : current_item);
        }

        setLayout(
            layout.map((w) => {
                return w.i === item.i && !is_save ? float_item : w;
            })
        );
        return layout.map((w) => {
            return dragToGrid(w, grid);
        });
    };

    const getCurrentLayoutByItem = (item: ItemPos, is_save?: boolean) => {
        // return moveLayoutV1(item, is_save);
        return moveLayoutV2(item, is_save);
    };

    /**
     * 更改画布宽高属性
     */
    const changeCanvasAttrs = () => {
        // 画板计算大小
        const {
            padding,
            grid,
            bound,
            t_offset,
            l_offset,
            current_height,
            current_width,
            wrapper_calc_width,
            wrapper_calc_height
        } = getMaxWidgetsRange(canvas_viewport, container_ref, props);

        setPadding(padding);
        setGrid(grid);
        setBound(bound);
        setCanvasWrapperWidth(wrapper_calc_width);
        setCanvasWrapperHeight(wrapper_calc_height);
        setCurrentHeight(current_height);
        setCurrentWidth(current_width);
        setTopOffset(t_offset);
        setLeftOffset(l_offset);
    };

    useEffect(() => {
        changeCanvasAttrs();
        addEvent(document, 'resize', changeCanvasAttrs);
        return () => {
            removeEvent(document, 'resize', changeCanvasAttrs);
        };
    }, [
        (props as DragLayoutProps).height,
        (props as DragLayoutProps).width,
        props.scale,
        props.children
    ]);

    return (
        <div
            className={`react-drag-layout ${styles.container}`}
            ref={container_ref}
        >
            {/* 水平标尺 */}
            {props.mode === LayoutType.edit &&
                canvas_viewport.current &&
                props.need_ruler && (
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
                {props.mode === LayoutType.edit &&
                    canvas_viewport.current &&
                    props.need_ruler && (
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
                    style={{ overflow: 'auto', position: 'relative', flex: 1 }}
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
                        onClick={onClick}
                    >
                        {/* 实际画布区域 */}
                        {current_width && current_height && grid && (
                            <div
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
                                onClick={onClick}
                            >
                                {shadow_widget && (
                                    <WidgetItem
                                        {...shadow_widget}
                                        width={current_width}
                                        height={current_height}
                                        bound={bound}
                                        padding={padding}
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
                                        const widget = layout[idx];
                                        if (widget) {
                                            return (
                                                <WidgetItem
                                                    layout_type={
                                                        props.layout_type
                                                    }
                                                    key={widget.i}
                                                    {...widget}
                                                    {...child.props}
                                                    padding={padding}
                                                    grid={grid}
                                                    bound={bound}
                                                    children={child}
                                                    width={current_width}
                                                    height={current_height}
                                                    scale={props.scale}
                                                    margin={props.item_margin}
                                                    is_resizable={
                                                        widget.is_resizable &&
                                                        checked_index ===
                                                            widget.i
                                                    }
                                                    setCurrentChecked={
                                                        setCurrentChecked
                                                    }
                                                    onDragStart={() => {
                                                        checked_index ===
                                                        widget.i
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
                                                                    item
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
                                                                    item,
                                                                    true
                                                                );
                                                            (
                                                                props as EditLayoutProps
                                                            ).onDragStop?.(
                                                                layout
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
                                                                    item
                                                                );
                                                            (
                                                                props as EditLayoutProps
                                                            ).onResize?.(
                                                                layout
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
                                                    onPositionChange={(
                                                        item
                                                    ) => {
                                                        if (
                                                            checked_index ===
                                                            widget.i
                                                        ) {
                                                            const layout =
                                                                getCurrentLayoutByItem(
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
                        )}
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
    row_height: 20,
    container_padding: [10],
    item_margin: [0, 0],
    mode: LayoutType.view,
    need_ruler: false
};

export default ReactDragLayout;
