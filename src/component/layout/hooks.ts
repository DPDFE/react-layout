import {
    BoundType,
    DragLayoutProps,
    ItemPos,
    LayoutItem,
    LayoutType,
    ReactDragLayoutProps
} from '@/interfaces';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
    calcOffset,
    completedPadding,
    getMaxLayoutBound,
    TOP_RULER_LEFT_MARGIN,
    WRAPPER_PADDING
} from './calc';

export const useLayoutHooks = (
    props: ReactDragLayoutProps,
    container_ref: React.RefObject<HTMLDivElement>,
    canvas_viewport: React.RefObject<HTMLDivElement>,
    shadow_widget?: ItemPos,
    layout?: LayoutItem[]
) => {
    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [current_height, setCurrentHeight] = useState<number>(0); //高度;

    const [is_window_resize, setWindowResize] = useState<number>(Math.random());

    /** 监听容器变化，重新计算width、height、grid */
    useLayoutEffect(() => {
        /**
         * 缩放容器触发器
         */
        const resizeObserverInstance = new ResizeObserver(() => {
            setWindowResize(Math.random());
        });

        if (layout && container_ref.current) {
            resizeObserverInstance.observe(container_ref.current);
        }
        return () => {
            if (layout && container_ref.current) {
                resizeObserverInstance.unobserve(container_ref.current);
                resizeObserverInstance.disconnect();
            }
        };
    }, [layout, JSON.stringify(shadow_widget)]);

    /**
     * 计算当前容器宽度
     */
    function getCurrentWidth() {
        const { need_ruler, layout_type } = props;
        const offset_width = need_ruler ? TOP_RULER_LEFT_MARGIN : 0;

        const current_width =
            layout_type === LayoutType.DRAG
                ? (props as DragLayoutProps).width
                : container_ref.current?.clientWidth
                ? container_ref.current?.clientWidth - offset_width
                : 0;

        return current_width;
    }
    /**
     * 画布宽度计算
     */
    const current_width = useMemo(
        () => getCurrentWidth(),
        [
            container_ref.current,
            props.need_ruler,
            props.layout_type,
            is_window_resize
        ]
    );

    /** 补全边距 */
    const padding = useMemo(
        () => completedPadding(props.container_padding),
        [props.container_padding]
    );

    function getCurrentGrid() {
        const { item_margin, cols, row_height } = props;

        const width =
            current_width -
            (padding.right > item_margin[1]
                ? padding.right - item_margin[1] + padding.left
                : item_margin[1]);

        return {
            col_width: width / cols,
            row_height
        };
    }

    /**
     * 单元格宽高计算
     */
    const grid = useMemo(
        () => getCurrentGrid(),
        [
            props.item_margin,
            props.cols,
            props.row_height,
            current_width,
            padding
        ]
    );

    function calcBoundRange(): BoundType {
        return {
            min_y: 0,
            min_x: 0,
            max_y:
                props.layout_type === LayoutType.GRID
                    ? Infinity
                    : current_height - padding.bottom - padding.top,
            max_x: current_width - padding.right - padding.left
        };
    }

    /** 计算移动范围 */
    const bound = useMemo(
        () => calcBoundRange(),
        [current_width, current_height, padding]
    );

    const getCurrentHeight = () => {
        const { need_ruler, layout_type } = props;
        const offset_height = need_ruler ? TOP_RULER_LEFT_MARGIN : 0;

        const current_height =
            layout_type === LayoutType.DRAG
                ? (props as DragLayoutProps).height
                : container_ref.current?.clientHeight
                ? container_ref.current?.clientHeight - offset_height
                : 0;

        return current_height;
    };

    const GetCurrentContainerHeight = () => {
        if (!layout) {
            return;
        }

        const { layout_type, mode, scale } = props;

        const current_height = getCurrentHeight();

        const current_layout = layout.concat(
            shadow_widget ? [shadow_widget] : []
        );
        const { max_left, max_right, max_top, max_bottom } =
            getMaxLayoutBound(current_layout);

        // 如果没有宽高就是自适应模式
        if (layout_type === LayoutType.GRID) {
            const _h =
                max_bottom > current_height
                    ? max_bottom + padding.bottom
                    : current_height;

            setCanvasWrapperWidth(current_width);
            setCanvasWrapperHeight(_h);
            setCurrentHeight(_h);
            setTopOffset(0);
            setLeftOffset(0);
        } else {
            const calc_width = current_width * scale;
            const calc_height = current_height * scale;

            // 视窗的宽、高度
            const client_height = canvas_viewport.current?.clientHeight
                ? canvas_viewport.current?.clientHeight
                : 0;
            const client_width = canvas_viewport.current?.clientWidth
                ? canvas_viewport.current?.clientWidth
                : 0;

            if (client_height === 0 || client_width === 0) {
                throw new Error('需要给画布父元素增加高度、宽度信息。');
            }
            if (client_height > document.body.clientHeight) {
                throw new Error('需要给画布父元素增加高度。');
            }

            // 计算水平、垂直偏移量
            if (mode === LayoutType.edit) {
                const ele_width = max_right * scale - max_left * scale;
                const ele_height = max_bottom * scale - max_top * scale;

                const l_offset =
                    calcOffset(client_width, calc_width + WRAPPER_PADDING) +
                    WRAPPER_PADDING / 2;
                const t_offset =
                    calcOffset(client_height, calc_height + WRAPPER_PADDING) +
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
                setCurrentHeight(current_height);
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
                setCanvasWrapperHeight(Math.max(calc_height, client_height));
                setCurrentHeight(current_height);
                setTopOffset(t_offset);
                setLeftOffset(l_offset);
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
        is_window_resize
    ]);

    return {
        is_window_resize,
        current_width,
        padding,
        grid,
        bound,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset
    };
};
