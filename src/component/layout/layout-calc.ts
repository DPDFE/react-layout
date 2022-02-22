import {
    BoundType,
    DragLayoutProps,
    GridType,
    ItemPos,
    LayoutItem,
    LayoutType,
    MarginType,
    ReactDragLayoutProps
} from '@/interfaces';
import { ReactElement, RefObject } from 'react';
import { compact } from './canvas-calc';

export const RULER_GAP = 100; // 标尺间隔大小
export const TOP_RULER_LEFT_MARGIN = 15; //顶部标尺左侧间隔
export const WRAPPER_PADDING = 200; // 编辑状态下的边框

// 生成从0开始的数组
export const reciprocalNum = (count1: number, count2: number) => {
    const list: any[] = [];
    for (let i = -count1; i <= count2; i++) {
        list.push(i);
    }
    return list;
};

// 获取5的整数倍数值
export const fiveMultipleIntergral = (count: number, approximation = 5) => {
    const max = Math.ceil(count / approximation) * approximation;
    const min = Math.floor(count / approximation) * approximation;
    return max - count >= approximation / 2 ? min : max;
};

export function completedPadding(
    bound?: [number, number?, number?, number?]
): MarginType {
    let pos = { top: 0, right: 0, bottom: 0, left: 0 };
    if (bound) {
        switch (bound.length) {
            case 1:
                pos = {
                    top: bound[0],
                    right: bound[0],
                    bottom: bound[0],
                    left: bound[0]
                };
                break;
            case 2:
                pos = {
                    top: bound[0],
                    right: bound[1] as number,
                    bottom: bound[0],
                    left: bound[1] as number
                };
                break;
            case 3:
                pos = {
                    top: bound[0],
                    right: bound[1] as number,
                    bottom: bound[2] as number,
                    left: bound[1] as number
                };
                break;
            case 4:
                pos = {
                    top: bound[0],
                    right: bound[1] as number,
                    bottom: bound[2] as number,
                    left: bound[3] as number
                };
                break;
        }
    }
    return pos;
}

export function calcBoundRange(
    current_width: number,
    current_height: number,
    bound_border: MarginType
): BoundType {
    return {
        min_y: 0,
        min_x: 0,
        // max_y: current_height - bound_border.bottom - bound_border.top,
        max_y: Infinity,
        max_x: current_width - bound_border.right - bound_border.left
    };
}

export const getCurrentHeight = (
    container_ref: RefObject<HTMLDivElement>,
    props: ReactDragLayoutProps
) => {
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

function getCurrentWidth(
    container_ref: RefObject<HTMLDivElement>,
    props: ReactDragLayoutProps
) {
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

function getCurrentGrid(
    props: ReactDragLayoutProps,
    current_width: number,
    padding: MarginType
) {
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

export function gridToDrag(widget: ItemPos, grid: GridType): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        return {
            ...widget,
            x: widget.x * grid.col_width,
            y: widget.y * grid.row_height,
            w: widget.w * grid.col_width,
            h: widget.h * grid.row_height
        };
    }
}

export function getCurrentLayout(
    children: React.ReactElement[],
    grid: GridType
) {
    const new_layout = children.map((child) => {
        const item = child.props['data-drag'] as LayoutItem;

        return {
            ...gridToDrag(item, grid),
            is_float: item.is_float ?? false,
            is_draggable: item.is_draggable ?? false,
            is_resizable: item.is_resizable ?? false
        };
    });

    compact(new_layout, grid.row_height);
    return new_layout;
}

export const getMaxWidgetsRange = (
    canvas_viewport: RefObject<HTMLDivElement>,
    container_ref: RefObject<HTMLDivElement>,
    props: ReactDragLayoutProps,
    layout: LayoutItem[]
) => {
    const { layout_type, mode, scale, children } = props;

    const current_width = getCurrentWidth(container_ref, props);
    const current_height = getCurrentHeight(container_ref, props);

    console.log(current_width, current_height);

    const padding = completedPadding(props.container_padding);
    const grid = getCurrentGrid(props, current_width, padding);

    const { max_left, max_right, max_top, max_bottom } =
        getMaxLayoutBound(layout);

    // 如果没有宽高就是自适应模式
    if (layout_type === LayoutType.GRID) {
        const _h =
            max_bottom > current_height
                ? max_bottom + padding.top + padding.bottom
                : current_height;

        return {
            grid,
            t_offset: 0,
            l_offset: 0,
            current_width,
            current_height: _h,
            wrapper_calc_width: current_width,
            wrapper_calc_height: _h
        };
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

            return {
                grid,
                wrapper_calc_width,
                wrapper_calc_height,
                t_offset: t_offset + Math.abs(max_top) * scale,
                l_offset: l_offset + Math.abs(max_left) * scale,
                current_height,
                current_width,
                t_scroll: Math.abs(max_top) * scale,
                l_scroll: Math.abs(max_left) * scale
            };
        } else {
            const l_offset = calcOffset(client_width, calc_width);
            const t_offset = calcOffset(client_height, calc_height);

            return {
                grid,
                wrapper_calc_width: Math.max(calc_width, client_width),
                wrapper_calc_height: Math.max(calc_height, client_height),
                current_height,
                current_width,
                l_offset,
                t_offset
            };
        }
    }
};

function calcOffset(client: number, calc: number) {
    return client - calc > 0 ? (client - calc) / 2 : 0;
}

function getMaxLayoutBound(children: LayoutItem[]) {
    // 元素计算大小
    let max_left = 0,
        max_right = 0,
        max_top = 0,
        max_bottom = 0;

    if (children) {
        children.map((child) => {
            const { x, y, h, w } = child;

            max_left = Math.min(max_left, x); // 最左边最小值
            max_right = Math.max(max_right, x + w); // 最大值
            max_top = Math.min(max_top, y); // 最上边最小值
            max_bottom = Math.max(max_bottom, y + h); // 最大值
        });
    }
    return { max_left, max_right, max_top, max_bottom };
}
