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
import {
    calcOffset,
    calcWH,
    calcXY,
    calcXYWH,
    completedPadding,
    WRAPPER_PADDING
} from '../context/calc';
import ResizeObserver from 'resize-observer-polyfill';
import { LayoutContext } from '../context';
import { clamp, DEFAULT_BOUND } from '../../canvas/draggable';

export const useLayoutHooks = (
    layout: LayoutItem[],
    props: ReactLayoutProps,
    container_ref: React.RefObject<HTMLDivElement>,
    canvas_viewport_ref: React.RefObject<HTMLDivElement>,
    shadow_widget?: ItemPos
) => {
    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [is_window_resize, setWindowResize] = useState<number>(Math.random());

    const { operator_type, moving_droppable } = useContext(LayoutContext);

    /** 视窗宽度 */
    const container_width = canvas_viewport_ref.current?.offsetWidth ?? 10;
    /** 视窗高度 */
    const container_height = canvas_viewport_ref.current?.offsetHeight ?? 10;

    /**
     * 画布宽度计算，在栅栏格式下，元素只能在画布内拖动
     */
    const current_width = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).width
            : container_width;
    }, [props.layout_type, container_width, (props as DragLayoutProps).width]);

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

    /** 补全边距 */
    const padding = useMemo(
        () => completedPadding(props.container_padding),
        [props.container_padding]
    );

    /** 单元素水平边距 */
    const margin_x = props.item_margin[1];

    /** 单元素垂直边距 */
    const margin_y = props.item_margin[0];

    /** 单元格宽度 */
    const col_width =
        (current_width -
            (margin_x * (props.cols - 1) + (padding.left + padding.right))) /
        props.cols;

    /** 单元格高度 */
    const row_height = props.row_height;

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
                      i: 'placeholder',
                      layout_id: ''
                  })
                : layout;

        calc_layout.forEach((l) => {
            const out = calcXYWH(
                l,
                col_width,
                row_height,
                margin_x,
                margin_y,
                padding
            );

            max_left = Math.min(max_left, out.x);
            max_right = Math.max(max_right, out.x + out.w + padding.right);
            max_top = Math.min(max_top, out.y);
            max_bottom = Math.max(max_bottom, out.y + out.h + padding.bottom);
        });

        return { max_left, max_right, max_top, max_bottom };
    }, [
        layout,
        shadow_widget,
        container_height,
        props.layout_type,
        (props as DragLayoutProps).height
    ]);

    const current_height: number = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).height
            : Math.max(max_bottom, container_height);
    }, [
        props.layout_type,
        (props as DragLayoutProps).height,
        max_bottom,
        container_height
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
        if (pos.is_resizing || pos.is_dropping || pos.is_dragging) {
            pos.x = calcXY(pos.x, col_width, margin_x, padding.left);
            pos.y = calcXY(pos.y, row_height, margin_y, padding.top);
        }

        if (pos.is_resizing) {
            pos.w = calcWH(pos.w, col_width, margin_x);
            pos.h = calcWH(pos.h, row_height, margin_y);
        }

        delete pos.is_dropping;
        delete pos.is_resizing;
        delete pos.is_dragging;

        return boundControl(pos);
    };

    const GetCurrentContainerHeight = () => {
        if (container_width && container_height) {
            const { layout_type, mode, scale } = props;

            const height_stragegy = {
                [LayoutType.GRID]: () => {
                    /** 和视窗比较，找到实际最大边界 */
                    const max_b = Math.max(max_bottom, container_height);

                    const calc_width = current_width * scale;
                    const calc_height = container_height * scale;

                    const l_offset = calcOffset(container_width, calc_width);
                    const t_offset = calcOffset(container_height, calc_height);

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
                                container_width,
                                calc_width + WRAPPER_PADDING
                            ) +
                            WRAPPER_PADDING / 2;
                        const t_offset =
                            calcOffset(
                                container_height,
                                calc_height + WRAPPER_PADDING
                            ) +
                            WRAPPER_PADDING / 2;

                        const wrapper_calc_width = Math.max(
                            calc_width > ele_width
                                ? calc_width + WRAPPER_PADDING
                                : ele_width + 2 * l_offset,
                            container_width
                        );
                        const wrapper_calc_height = Math.max(
                            calc_height > ele_height
                                ? calc_height + WRAPPER_PADDING
                                : ele_height + 2 * t_offset,
                            container_height
                        );

                        setCanvasWrapperWidth(wrapper_calc_width);
                        setCanvasWrapperHeight(wrapper_calc_height);
                        setTopOffset(t_offset + Math.abs(max_top) * scale);
                        setLeftOffset(l_offset + Math.abs(max_left) * scale);
                    } else {
                        const l_offset = calcOffset(
                            container_width,
                            calc_width
                        );
                        const t_offset = calcOffset(
                            container_height,
                            calc_height
                        );

                        setCanvasWrapperWidth(
                            Math.max(calc_width, container_width)
                        );
                        setCanvasWrapperHeight(
                            Math.max(calc_height, container_height)
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
        margin_x,
        margin_y,
        col_width,
        row_height,
        props.scale,
        max_left,
        max_right,
        max_top,
        max_bottom,
        operator_type.current,
        container_width,
        container_height,
        (props as DragLayoutProps).height,
        (props as DragLayoutProps).width
    ]);

    return {
        margin_x,
        margin_y,
        col_width,
        row_height,
        container_width,
        padding,
        is_window_resize,
        current_width,
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
