import {
    DragLayoutProps,
    ItemPos,
    LayoutItem,
    LayoutType,
    LayoutMode,
    OperatorType,
    ReactLayoutProps
} from '@/interfaces';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
    calcOffset,
    completedPadding,
    snapToDrag,
    TOP_RULER_LEFT_MARGIN,
    WRAPPER_PADDING
} from './calc';

export const useLayoutHooks = (
    layout: LayoutItem[],
    props: ReactLayoutProps,
    canvas_viewport_ref: React.RefObject<HTMLDivElement>,
    shadow_widget_ref: React.RefObject<HTMLDivElement>,
    shadow_widget?: ItemPos,
    operator_type?: OperatorType
) => {
    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [current_height, setCurrentHeight] = useState<number>(0); //高度;

    const [is_window_resize, setWindowResize] = useState<number>(Math.random());

    /**
     * 让阴影定位组件位于可视范围内
     */
    useLayoutEffect(() => {
        /** 判断元素是否消失 */
        const intersectionObserverInstance = new IntersectionObserver(
            (entries) => {
                entries.map((entry) => {
                    if (!entry.intersectionRatio) {
                        if (props.is_nested_layout) {
                            return;
                        }
                        shadow_widget_ref.current?.scrollIntoView({
                            block: 'nearest',
                            inline: 'nearest'
                        });
                    }
                });
            },
            { root: canvas_viewport_ref.current }
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

        if (canvas_viewport_ref.current) {
            resizeObserverInstance.observe(canvas_viewport_ref.current);
        }
        return () => {
            if (canvas_viewport_ref.current) {
                resizeObserverInstance.unobserve(canvas_viewport_ref.current);
                resizeObserverInstance.disconnect();
            }
        };
    }, [canvas_viewport_ref]);

    /** 视窗宽度 */
    const client_width = useMemo(() => {
        return canvas_viewport_ref.current
            ? canvas_viewport_ref.current.clientWidth
            : 0;
    }, [is_window_resize]);

    /** 视窗高度 */
    const client_height = useMemo(() => {
        return canvas_viewport_ref.current
            ? canvas_viewport_ref.current.clientHeight
            : 0;
    }, [is_window_resize]);

    /**
     * 画布宽度计算
     */
    const current_width = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).width
            : client_width;
    }, [props.layout_type, client_width]);

    /** 补全边距 */
    const padding = useMemo(
        () => completedPadding(props.container_padding),
        [props.container_padding]
    );

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

    /** 获取元素最大边界 */
    function getMaxLayoutBound(children: LayoutItem[]) {
        // 元素计算大小
        let max_left = 0,
            max_right = 0,
            max_top = 0,
            max_bottom = 0;

        if (children) {
            children.map((child) => {
                const { x, y, h, w, is_float } = snapToDrag(child, grid);

                max_left = Math.min(max_left, x); // 最左边最小值
                max_right = Math.max(
                    max_right,
                    x +
                        w +
                        (is_float
                            ? padding.right
                            : Math.max(0, padding.left - props.item_margin[1]) +
                              Math.max(padding.right, props.item_margin[1]))
                ); // 最大值
                max_top = Math.min(max_top, y); // 最上边最小值
                max_bottom = Math.max(
                    max_bottom,
                    y +
                        h +
                        (is_float
                            ? padding.bottom
                            : Math.max(0, padding.top - props.item_margin[0]) +
                              Math.max(padding.bottom, props.item_margin[0]))
                ); // 最大值
            });
        }
        return { max_left, max_right, max_top, max_bottom };
    }

    const GetCurrentContainerHeight = () => {
        if (props.layout_type === LayoutType.DRAG && operator_type) {
            return;
        }
        if (client_width && client_height) {
            const { layout_type, mode, scale } = props;

            const current_height =
                props.layout_type === LayoutType.DRAG
                    ? (props as DragLayoutProps).height
                    : client_height;
            const { max_left, max_right, max_top, max_bottom } =
                getMaxLayoutBound(
                    layout.concat(shadow_widget ? [shadow_widget] : [])
                );

            /** 和视窗比较，找到实际最大边界 */
            const max_b =
                max_bottom > current_height ? max_bottom : current_height;

            const max_r = max_right > current_width ? max_right : current_width;

            // 如果没有宽高就是自适应模式
            if (layout_type === LayoutType.GRID) {
                setCanvasWrapperWidth(current_width);
                setCanvasWrapperHeight(max_b);
                setCurrentHeight(max_b);
                setTopOffset(0);
                setLeftOffset(0);
            } else {
                const calc_width = current_width * scale;
                const calc_height = current_height * scale;

                // 计算水平、垂直偏移量
                if (mode === LayoutMode.edit) {
                    const ele_width = (max_r - max_left) * scale;
                    const ele_height = (max_b - max_top) * scale;

                    const l_offset =
                        calcOffset(client_width, calc_width + WRAPPER_PADDING) +
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

                    setCurrentHeight(current_height);
                    setCanvasWrapperWidth(wrapper_calc_width);
                    setCanvasWrapperHeight(wrapper_calc_height);
                    setTopOffset(t_offset + Math.abs(max_top) * scale);
                    setLeftOffset(l_offset + Math.abs(max_left) * scale);

                    // return {
                    //     t_scroll: Math.abs(max_top) * scale,
                    //     l_scroll: Math.abs(max_left) * scale
                    // };
                } else {
                    const l_offset = calcOffset(client_width, calc_width);
                    const t_offset = calcOffset(client_height, calc_height);

                    setCanvasWrapperWidth(Math.max(calc_width, client_width));
                    setCanvasWrapperHeight(
                        Math.max(calc_height, client_height)
                    );
                    setCurrentHeight(current_height);
                    setTopOffset(t_offset);
                    setLeftOffset(l_offset);
                }
            }
        }
    };

    /** resize计算新的画布高度、元素容器大小和偏移量 */
    useEffect(() => {
        GetCurrentContainerHeight();
    }, [
        (props as DragLayoutProps).height,
        (props as DragLayoutProps).width,
        props.scale,
        operator_type,
        client_height,
        client_width
    ]);

    return {
        is_window_resize,
        current_width,
        padding,
        grid,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset
    };
};
