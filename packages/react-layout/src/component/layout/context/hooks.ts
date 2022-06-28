import {
    DragLayoutProps,
    ItemPos,
    LayoutItem,
    LayoutType,
    LayoutMode,
    ReactLayoutProps,
    WidgetType
} from '@/interfaces';
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    useContext,
    useRef
} from 'react';
import {
    calcOffset,
    completedPadding,
    replaceWidget,
    snapToDragBound,
    WRAPPER_PADDING
} from './calc';
import ResizeObserver from 'resize-observer-polyfill';
import { LayoutContext } from '.';
import { clamp, DEFAULT_BOUND } from '../../canvas/draggable';
import { useScroll } from 'ahooks';

export const useLayoutHooks = (
    layout: LayoutItem[],
    props: ReactLayoutProps,
    container_ref: React.RefObject<HTMLDivElement>,
    canvas_viewport_ref: React.RefObject<HTMLDivElement>,
    shadow_widget_ref: React.RefObject<HTMLDivElement>,
    shadow_widget?: ItemPos
) => {
    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [current_height, setCurrentHeight] = useState<number>(0); //高度;

    const [is_window_resize, setWindowResize] = useState<number>(Math.random());

    const { operator_type } = useContext(LayoutContext);

    // /**
    //  * 让阴影定位组件位于可视范围内
    //  */
    // useLayoutEffect(() => {
    //     /** 判断元素是否消失 */
    //     const intersectionObserverInstance = new IntersectionObserver(
    //         (entries) => {
    //             entries.map((entry) => {
    //                 if (!entry.intersectionRatio) {
    //                     shadow_widget_ref.current?.scrollIntoView({
    //                         block: 'nearest',
    //                         inline: 'nearest'
    //                     });
    //                 }
    //             });
    //         },
    //         { root: canvas_viewport_ref.current }
    //     );

    //     shadow_widget &&
    //         shadow_widget_ref.current &&
    //         intersectionObserverInstance.observe(shadow_widget_ref.current);
    //     return () => {
    //         shadow_widget &&
    //             shadow_widget_ref.current &&
    //             intersectionObserverInstance.unobserve(
    //                 shadow_widget_ref.current
    //             );
    //     };
    // }, [JSON.stringify(shadow_widget)]);

    /** 监听容器变化，重新计算width、height、grid */
    useLayoutEffect(() => {
        /**
         * 缩放容器触发器
         */
        const resizeObserverInstance = new ResizeObserver(() => {
            setWindowResize(Math.random());
        });

        if (container_ref.current) {
            resizeObserverInstance.observe(container_ref.current);
        }
        return () => {
            if (container_ref.current) {
                resizeObserverInstance.unobserve(container_ref.current);
                resizeObserverInstance.disconnect();
            }
        };
    }, [container_ref]);

    /** 视窗宽度 */
    const client_width = useMemo(() => {
        return canvas_viewport_ref.current?.clientWidth ?? 0;
    }, [is_window_resize]);

    /** 视窗高度 */
    const client_height = useMemo(() => {
        return canvas_viewport_ref.current?.clientHeight ?? 0;
    }, [is_window_resize]);

    /** 补全边距 */
    const padding = useMemo(
        () => completedPadding(props.container_padding),
        [props.container_padding]
    );

    /** 根据类型配置计算边界状态 */
    const getCurrentBound = (type: WidgetType) => {
        const bound_strategy = {
            [WidgetType.drag]: () => {
                return props.need_drag_bound
                    ? {
                          min_x: padding.left,
                          max_x: current_width - padding.right,
                          min_y: padding.top,
                          max_y: current_height
                              ? current_height - padding.bottom
                              : Infinity
                      }
                    : DEFAULT_BOUND;
            },
            [WidgetType.grid]: () => {
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

        return bound_strategy[type]();
    };

    /**
     * 画布宽度计算，在栅栏格式下，元素只能在画布内拖动
     */
    const current_width = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).width
            : client_width;
    }, [props.layout_type, client_width]);

    /**
     * 单元格宽高计算
     */
    const grid = useMemo(() => {
        const { item_margin, cols, row_height } = props;

        const sub_left = current_width - Math.max(padding.left, item_margin[1]);
        const width = sub_left - Math.max(item_margin[1] - padding.right, 0);

        return {
            col_width: width / cols,
            row_height
        };
    }, [
        props.item_margin,
        props.cols,
        props.row_height,
        current_width,
        padding
    ]);

    /** 对drop节点做边界计算以后再排序 */
    const boundControl = (item: LayoutItem) => {
        const { max_x, min_x, max_y, min_y } = getCurrentBound(item.type);

        item.x = clamp(item.x, min_x, max_x - item.w);
        item.y = clamp(item.y, min_y, max_y - item.h);

        if (item.type === WidgetType.grid) {
            if (item.w > props.cols) {
                item.w = props.cols;
                item.x = 0;
            } else if (item.w < props.cols && item.x + item.w > props.cols) {
                item.x = props.cols - item.w;
            }
        }

        return item;
    };

    const snapToGrid = (pos: LayoutItem) => {
        const { row_height, col_width } = grid;

        delete pos.is_dragging;
        pos.x = Math.round(pos.x / col_width);
        pos.y = Math.round(pos.y / row_height);
        pos.w = Math.round(pos.w / col_width);
        pos.h = Math.round(pos.h / row_height);

        return boundControl(pos);
    };

    const snapToDrag = (l: LayoutItem) => {
        const { type, is_dragging } = l;

        const { min_x, max_x, min_y, max_y } = is_dragging
            ? DEFAULT_BOUND
            : snapToDragBound(getCurrentBound(l.type), grid, type);

        const is_float = type === WidgetType.drag;

        const gridX = (count: number) => {
            return is_float || is_dragging ? count : count * grid.col_width;
        };
        const gridY = (count: number) => {
            return is_float || is_dragging ? count : count * grid.row_height;
        };

        const layout_item_strategy = {
            [WidgetType.drag]: () => {
                return {
                    margin_height: 0,
                    margin_width: 0,
                    offset_x: 0,
                    offset_y: 0
                };
            },
            [WidgetType.grid]: () => {
                return {
                    margin_height: props.item_margin[0],
                    margin_width: props.item_margin[1],
                    offset_x: Math.max(props.item_margin[1], padding.left),
                    offset_y: Math.max(props.item_margin[0], padding.top)
                };
            }
        };

        const { offset_x, offset_y, margin_height, margin_width } =
            layout_item_strategy[type]();

        const w = Math.max(gridX(l.w) - margin_width, 0);
        const h = Math.max(gridY(l.h) - margin_height, 0);

        const x = clamp(gridX(l.x) + offset_x, min_x, max_x - w);
        const y = clamp(gridY(l.y) + offset_y, min_y, max_y - h);

        return {
            ...l,
            w,
            h,
            x,
            y,
            offset_x,
            offset_y,
            margin_height,
            margin_width,
            min_x,
            max_x,
            min_y,
            max_y
        };
    };

    /** 获取元素最大边界 */
    const { max_left, max_right, max_top, max_bottom } = useMemo(() => {
        // 元素计算大小
        let max_left = 0,
            max_right = 0,
            max_top = 0,
            max_bottom = 0;

        for (const [_, value] of Object.entries(
            replaceWidget(layout, shadow_widget)
        )) {
            const { x, y, h, w } = snapToDrag(value);

            max_left = Math.min(max_left, x);
            max_right = Math.max(max_right, x + w + padding.right);
            max_top = Math.min(max_top, y);
            max_bottom = Math.max(max_bottom, y + h + padding.bottom);
        }

        return { max_left, max_right, max_top, max_bottom };
    }, [layout, shadow_widget]);

    const GetCurrentContainerHeight = () => {
        if (props.layout_type === LayoutType.DRAG && operator_type.current) {
            return;
        }
        if (client_width && client_height) {
            const { layout_type, mode, scale } = props;

            const height_stragegy = {
                [LayoutType.GRID]: () => {
                    /** 和视窗比较，找到实际最大边界 */
                    const max_b = Math.max(max_bottom, client_height);

                    const calc_width = current_width * scale;
                    const calc_height = client_height * scale;

                    const l_offset = calcOffset(client_width, calc_width);
                    const t_offset = calcOffset(client_height, calc_height);

                    setCanvasWrapperWidth(current_width);
                    setCanvasWrapperHeight(max_b);
                    setCurrentHeight(max_b);
                    setTopOffset(t_offset);
                    setLeftOffset(l_offset);
                },
                [LayoutType.DRAG]: () => {
                    /** 和视窗比较，找到实际最大边界 */
                    const max_b = Math.max(
                        max_bottom,
                        (props as DragLayoutProps).height
                    );
                    const max_r = Math.max(max_right, current_width);

                    const calc_width = current_width * scale;
                    const calc_height =
                        (props as DragLayoutProps).height * scale;

                    // 计算水平、垂直偏移量
                    if (mode === LayoutMode.edit) {
                        const ele_width = (max_r - max_left) * scale;
                        const ele_height = (max_b - max_top) * scale;

                        const l_offset =
                            calcOffset(
                                client_width,
                                calc_width + WRAPPER_PADDING
                            ) +
                            WRAPPER_PADDING / 2;
                        const t_offset =
                            calcOffset(
                                client_height,
                                calc_height + WRAPPER_PADDING
                            ) +
                            WRAPPER_PADDING / 2;

                        const wrapper_calc_width = Math.max(
                            calc_width > ele_width
                                ? calc_width + WRAPPER_PADDING
                                : ele_width + 2 * l_offset,
                            client_width
                        );
                        const wrapper_calc_height = Math.max(
                            calc_height > ele_height
                                ? calc_height + WRAPPER_PADDING
                                : ele_height + 2 * t_offset,
                            client_height
                        );

                        setCurrentHeight((props as DragLayoutProps).height);
                        setCanvasWrapperWidth(wrapper_calc_width);
                        setCanvasWrapperHeight(wrapper_calc_height);
                        setTopOffset(t_offset + Math.abs(max_top) * scale);
                        setLeftOffset(l_offset + Math.abs(max_left) * scale);
                    } else {
                        const l_offset = calcOffset(client_width, calc_width);
                        const t_offset = calcOffset(client_height, calc_height);

                        setCanvasWrapperWidth(
                            Math.max(calc_width, client_width)
                        );
                        setCanvasWrapperHeight(
                            Math.max(calc_height, client_height)
                        );
                        setCurrentHeight((props as DragLayoutProps).height);
                        setTopOffset(t_offset);
                        setLeftOffset(l_offset);
                    }
                }
            };

            height_stragegy[layout_type ?? LayoutType.GRID]();
        }
    };

    /** resize计算新的画布高度、元素容器大小和偏移量 */
    useEffect(() => {
        GetCurrentContainerHeight();
    }, [
        (props as DragLayoutProps).height,
        (props as DragLayoutProps).width,
        props.scale,
        max_left,
        max_right,
        max_top,
        max_bottom,
        operator_type.current,
        client_width,
        client_height
    ]);

    return {
        padding,
        is_window_resize,
        current_width,
        grid,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset,
        snapToGrid,
        getCurrentBound,
        boundControl,
        snapToDrag
    };
};
