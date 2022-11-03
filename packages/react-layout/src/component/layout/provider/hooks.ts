import {
    DragLayoutProps,
    ItemPos,
    LayoutItem,
    LayoutType,
    LayoutMode,
    ReactLayoutProps,
    WidgetType,
    Pos,
    Droppable
} from '@/interfaces';
import { useEffect, useMemo, useState, useContext } from 'react';
import {
    calcOffset,
    calcWH,
    calcXY,
    completedPadding,
    gridXY,
    WRAPPER_PADDING
} from '../context/calc';
import { LayoutContext } from '../context';
import { clamp, DEFAULT_BOUND } from '../../canvas/draggable';
import { END_OPERATOR } from '../constants';
import { resizeObserver } from './resize-observer';

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

    // 监听页面变换
    resizeObserver(container_ref, () => {
        setWindowResize(Math.random());
    });

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

    /**
     * 边界范围
     */
    const bound = (l: LayoutItem) => {
        const { type, is_dragging, is_resizing, is_dropping } = l;
        if (is_dragging || is_resizing || is_dropping) {
            return DEFAULT_BOUND;
        }
        // drag
        else if (type === WidgetType.drag && props.need_drag_bound) {
            return {
                min_x: padding.left,
                max_x: current_width - padding.right,
                min_y: padding.top,
                max_y: (props as DragLayoutProps).height
                    ? (props as DragLayoutProps).height - padding.bottom
                    : Infinity
            };
        }
        // grid
        else if (type === WidgetType.grid && props.need_grid_bound) {
            return {
                min_x: 0,
                max_x: props.cols,
                min_y: 0,
                max_y: Infinity
            };
        }
        //
        return DEFAULT_BOUND;
    };

    /** 对drop节点做边界计算以后再排序 */
    const calcBound = (item: LayoutItem) => {
        const { max_x, min_x, max_y, min_y } = bound(item);

        item.w = clamp(item.w, min_x, max_x);
        item.h = clamp(item.h, min_y, max_y);
        item.x = clamp(item.x, min_x, max_x - item.w);
        item.y = clamp(item.y, min_y, max_y - item.h);

        return item;
    };

    /**
     * 只更新YH变换为col
     * @param item
     */
    const toXWcol = (item: LayoutItem) => {
        const { is_flex, is_resizing, is_dropping, is_dragging } = item;

        if (is_flex || is_resizing || is_dropping || is_dragging) {
            item.x = calcXY(item.x, col_width, margin_x, padding.left);
        }

        if (is_resizing || is_dragging) {
            item.w = calcWH(item.w, col_width, margin_x);
        }

        delete item.is_dragging;
        delete item.is_resizing;
        delete item.is_dropping;

        return calcBound(item);
    };

    /**
     * 只更新YH变换为col
     * @param item
     */
    const toYHcol = (item: LayoutItem) => {
        const { is_flex } = item;

        if (item.type === WidgetType.grid && !is_flex) {
            item.y = calcXY(item.y, row_height, margin_y, padding.top);
            item.h = Math.round(item.h / (row_height + margin_y));
            item.inner_h = item.h;
        }

        delete item.moved;
        delete item.is_dragging;
        delete item.is_resizing;
        delete item.is_dropping;

        return calcBound(item);
    };

    /**
     * 只更新XW变换成px
     */
    const toXWpx = (item: LayoutItem) => {
        const { type, is_resizing, is_dropping, is_dragging } = item;
        const { x, y, w, h } = calcBound(item);

        const out: Pos = {
            x: 0,
            w: 0,
            y,
            h,
            inner_h: item.inner_h
        };

        // drag/resizing/dragging
        if (type === WidgetType.drag || is_resizing || is_dragging) {
            out.w = Math.round(w);
        }
        // grid/is_flex
        else {
            out.w = gridXY(w, col_width, margin_x);
        }

        // drag/dragging/resizing/dropping
        if (
            type === WidgetType.drag ||
            is_dragging ||
            is_resizing ||
            is_dropping
        ) {
            out.x = Math.round(x);
        }
        // grid/is_flex
        else {
            out.x = Math.round((col_width + margin_x) * x + padding.left);
        }

        return out;
    };

    /**
     * 只更新YH变换成px
     */
    const toYHpx = (item: LayoutItem) => {
        const { type, is_resizing, is_dropping, is_dragging, is_flex } = item;
        const { x, y, w, h, inner_h } = calcBound(item);

        const out: Pos = {
            x,
            w,
            y: 0,
            h: 0,
            inner_h: item.inner_h
        };

        // drag/dragging/resizing/dropping/is_flex
        if (
            type === WidgetType.drag ||
            is_dragging ||
            is_resizing ||
            is_dropping ||
            is_flex
        ) {
            if (is_flex) {
                out.y = Math.round(y + padding.top);
            }

            out.y = Math.round(y);
        }
        // grid
        else {
            out.y = Math.round((row_height + margin_y) * y + padding.top);
        }

        // drag/dragging/resizing/dropping/is_flex
        if (type === WidgetType.drag || is_dragging || is_resizing || is_flex) {
            out.h = Math.round(h);
            out.inner_h = Math.round(inner_h ?? h);
        }
        // grid
        else {
            out.h = Math.round((row_height + margin_y) * h);
            out.inner_h = gridXY(h, row_height, margin_y);
        }

        return out;
    };

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

        calc_layout.forEach((out) => {
            max_left = Math.min(max_left, out.x);
            max_right = Math.max(max_right, out.x + out.w + padding.right);
            max_top = Math.min(max_top, out.y);
            max_bottom = Math.max(
                max_bottom,
                out.y + out.inner_h + padding.bottom
            );
        });

        return { max_left, max_right, max_top, max_bottom };
    }, [
        layout,
        shadow_widget,
        container_height,
        props.layout_type,
        (props as DragLayoutProps).height
    ]);

    /**
     * 实际高度
     */
    const real_height = useMemo(() => {
        return props.layout_type === LayoutType.DRAG
            ? (props as DragLayoutProps).height
            : max_bottom;
    }, [props.layout_type, (props as DragLayoutProps).height, max_bottom]);

    /**
     * 画布高度
     */
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
     * 获取当前容器wrapper高度
     */
    const GetCurrentContainerHeight = () => {
        if (container_width && container_height) {
            const { layout_type, mode, scale } = props;

            // 画布如何定位才能更好的使用呢
            if (
                (layout_type === LayoutType.DRAG &&
                    (!operator_type.current ||
                        (operator_type.current &&
                            END_OPERATOR.includes(operator_type.current)))) ||
                layout_type === LayoutType.GRID
            ) {
                const height_stragegy = {
                    [LayoutType.GRID]: () => {
                        /** 和视窗比较，找到实际最大边界 */
                        const max_b = Math.max(max_bottom, container_height);
                        // const max_b = max_bottom;

                        const calc_width = current_width * scale;
                        const calc_height = container_height * scale;

                        const l_offset = calcOffset(
                            container_width,
                            calc_width
                        );
                        const t_offset = calcOffset(
                            container_height,
                            calc_height
                        );

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
                            setLeftOffset(
                                l_offset + Math.abs(max_left) * scale
                            );
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
        }
    };

    /** 碰撞 */
    function collides(item_1: ItemPos, item_2: ItemPos): boolean {
        if (item_1.i === item_2.i) return false; // 相同节点
        if (item_1.x + item_1.w <= item_2.x) return false; // 👈
        if (item_1.x >= item_2.x + item_2.w) return false; // 👉
        if (item_1.y + item_1.h <= item_2.y) return false; // 👆
        if (item_1.y >= item_2.y + item_2.h) return false; // 👇
        return true;
    }

    /** 检测碰撞 */
    function getFirstCollision(layout: LayoutItem[], item: LayoutItem) {
        return layout.find((l) => {
            return collides(l, item);
        });
    }

    /** 最大边界 */
    function bottom(layout: LayoutItem[]) {
        let max = 0;
        layout.forEach((item) => {
            const out = toYHpx(item);

            max = Math.max(max, out.y + out.h);
        });
        return max;
    }

    /**
     * 碰撞排序
     * @param layout
     * @returns
     */
    const compact = (layout: LayoutItem[]) => {
        const compare_with: LayoutItem[] = [];
        const sorted = sortGridLayoutItems(layout);

        sorted.map((l) => {
            l.moved = false;
            l = LayoutItem(compare_with, l, sorted);
            compare_with.push(l);
        });

        return compare_with;
    };

    /**
     * 过滤grid类型
     * @param layout
     * @returns
     */
    function sortGridLayoutItems(layout: LayoutItem[]) {
        return layout
            .filter((l) => {
                return l.type === WidgetType.grid;
            })
            .sort((a, b) => {
                if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
                    return 1;
                } else if (a.y === b.y && a.x === b.x) {
                    return 0;
                }
                return -1;
            });
    }

    /**
     * 解决碰撞
     * @param layout
     * @param item
     * @param move_to
     */
    function resolveCompactionCollision(
        layout: LayoutItem[],
        item: LayoutItem,
        move_to: number
    ) {
        item.y += 1;
        const idx = layout
            .map((layoutItem) => {
                return layoutItem.i;
            })
            .indexOf(item.i);

        for (let i = idx + 1; i < layout.length; i++) {
            const l = layout[i];
            if (l.y > item.y + item.h) {
                break;
            }
            if (collides(item, l)) {
                resolveCompactionCollision(layout, l, move_to + item.h);
            }
        }
        item.y = move_to;
    }

    /**
     * 计算单个元素定位
     * @param compare_with
     * @param l
     * @param sorted
     * @returns
     */
    function LayoutItem(
        compare_with: LayoutItem[],
        l: LayoutItem,
        sorted: LayoutItem[]
    ) {
        l.y = Math.min(bottom(compare_with), l.y);

        while (l.y > 0) {
            if (getFirstCollision(compare_with, l)) {
                break;
            } else {
                l.y -= 1;
            }
        }

        let collides;
        while ((collides = getFirstCollision(compare_with, l))) {
            resolveCompactionCollision(sorted, l, collides.y + collides.h);
        }

        // 最小y不能小于padding top，因为flex类型的容器，无法控制距离顶部的最小高度
        // 所以在这里统一处理
        l.y = Math.max(l.y, padding.top);
        l.x = Math.max(l.x, 0);
        return l;
    }

    function getAllCollisions(sorted: LayoutItem[], item: LayoutItem) {
        return sorted.filter((l) => collides(l, item));
    }

    /**
     * 挪走
     * @param layout
     * @param l
     * @param collision
     * @param is_user_action
     * @returns
     */
    function moveElementAwayFromCollision(
        layout: LayoutItem[],
        l: LayoutItem,
        collision: LayoutItem,
        is_user_action: boolean = false
    ) {
        const fake_item: LayoutItem = {
            x: collision.x,
            y: Math.max(l.y - collision.h, 0),
            w: collision.w,
            h: collision.h,
            i: 'fake_item',
            inner_h: collision.inner_h,
            type: WidgetType.grid,
            layout_id: ''
        };

        if (is_user_action) {
            is_user_action = false;
            const _collision = getFirstCollision(layout, fake_item);
            if (!_collision) {
                return moveElement(
                    layout,
                    collision,
                    collision.x,
                    fake_item.y,
                    is_user_action
                );
            }
        }
        return moveElement(layout, collision, collision.x, collision.y + 1);
    }

    /**
     * 移动元素
     * @param layout
     * @param l
     * @param x
     * @param y
     * @param is_user_action
     * @returns
     */
    function moveElement(
        layout: LayoutItem[],
        l: LayoutItem,
        x: number,
        y: number,
        is_user_action: boolean = false
    ) {
        const old_y = l.y;
        l.x = x;
        l.y = y;
        l.moved = true;

        let sorted = sortGridLayoutItems(layout);
        if (old_y > l.y) sorted = sorted.reverse();

        const collisions = getAllCollisions(sorted, l);

        for (let i = 0, len = collisions.length; i < len; i++) {
            const collision = collisions[i];

            if (collision.moved) {
                continue;
            }

            layout = moveElementAwayFromCollision(
                sorted,
                l,
                collision,
                is_user_action
            );
        }
        return layout;
    }

    /** resize计算新的画布高度、元素容器大小和偏移量 */
    useEffect(() => {
        GetCurrentContainerHeight();
    }, [
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
        real_height,
        current_height,
        wrapper_width,
        wrapper_height,
        t_offset,
        l_offset,
        toXWpx,
        toYHpx,
        toYHcol,
        toXWcol,

        compact,
        calcBound,
        moveElement
    };
};
