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
    useContext
} from 'react';
import { calcOffset, completedPadding, WRAPPER_PADDING } from '../context/calc';
import ResizeObserver from 'resize-observer-polyfill';
import { LayoutContext } from '../context';
import { clamp, DEFAULT_BOUND } from '../../canvas/draggable';

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

    const [is_window_resize, setWindowResize] = useState<number>(Math.random());

    const { operator_type, moving_droppable } = useContext(LayoutContext);

    /**
     * 让阴影定位组件位于可视范围内
     */
    useLayoutEffect(() => {
        /** 判断元素是否消失 */
        const intersectionObserverInstance = new IntersectionObserver(
            (entries) => {
                entries.map((entry) => {
                    shadow_widget_ref.current?.scrollIntoView({
                        block: 'nearest',
                        inline: 'nearest',
                        behavior: 'smooth'
                    });
                });
            },
            {
                root: canvas_viewport_ref.current,
                threshold: [0].concat(
                    Array.from(new Array(10).keys()).map((i) => (i + 1) * 0.1)
                )
            }
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
        return canvas_viewport_ref.current?.offsetWidth ?? 0;
    }, [is_window_resize]);

    /** 视窗高度 */
    const client_height = useMemo(() => {
        return canvas_viewport_ref.current?.offsetHeight ?? 0;
    }, [is_window_resize]);

    /** 补全边距 */
    const padding = useMemo(
        () => completedPadding(props.container_padding),
        [props.container_padding]
    );

    /**
     * 画布宽度计算，在栅栏格式下，元素只能在画布内拖动
     */
    const current_width = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).width
            : client_width;
    }, [props.layout_type, client_width, (props as DragLayoutProps).width]);

    /**
     * 单元格宽高计算
     */
    const grid = useMemo(() => {
        const { item_margin, cols, row_height } = props;

        const offset_left = Math.max(padding.left, item_margin[1]);
        const offset_top =
            Math.max(item_margin[1], padding.right) - item_margin[1];

        const width = current_width - offset_top - offset_left;

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

    /** 获取元素最大边界 */
    const { max_left, max_right, max_top, max_bottom } = useMemo(() => {
        // 元素计算大小
        let max_left = 0,
            max_right = 0,
            max_top = 0,
            max_bottom = 0;

        const calc_layout =
            moving_droppable.current?.id === props.layout_id && shadow_widget
                ? layout.concat({
                      ...shadow_widget!,
                      i: '__dragging__',
                      layout_id: ''
                  })
                : layout;

        calc_layout.forEach((l) => {
            const { x, y, h, w, is_dragging, type } = l;

            const gridX = (count: number) => {
                return type === WidgetType.drag || is_dragging
                    ? count
                    : count * grid.col_width;
            };
            const gridY = (count: number) => {
                return type === WidgetType.drag || is_dragging
                    ? count
                    : count * grid.row_height;
            };

            max_left = Math.min(max_left, gridX(x));
            max_right = Math.max(max_right, gridX(x + w) + padding.right);
            max_top = Math.min(max_top, gridY(y));
            max_bottom = Math.max(max_bottom, gridY(y + h) + padding.bottom);
        });

        return { max_left, max_right, max_top, max_bottom };
    }, [
        layout,
        shadow_widget,
        client_height,
        props.layout_type,
        (props as DragLayoutProps).height
    ]);

    const current_height: number = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).height
            : Math.max(max_bottom, client_height);
    }, [
        props.layout_type,
        (props as DragLayoutProps).height,
        max_bottom,
        client_height
    ]);

    /**
     * 边界范围
     */
    const getBoundingSize = {
        [WidgetType.drag]: props.need_drag_bound
            ? {
                  min_x: padding.left,
                  max_x: current_width - padding.right,
                  min_y: padding.top,
                  max_y: current_height
                      ? current_height - padding.bottom
                      : Infinity
              }
            : DEFAULT_BOUND,
        [WidgetType.grid]: props.need_grid_bound
            ? {
                  min_x: 0,
                  max_x: props.cols,
                  min_y: 0,
                  max_y: Infinity
              }
            : DEFAULT_BOUND
    };

    /** 对drop节点做边界计算以后再排序 */
    const boundControl = (item: LayoutItem) => {
        const { max_x, min_x, max_y, min_y } = getBoundingSize[item.type];

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

    const GetCurrentContainerHeight = () => {
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
        getBoundingSize,
        boundControl
    };
};
