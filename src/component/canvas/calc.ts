import { CanvasProps, LayoutItem, ItemPos, LayoutType } from '@/interfaces';
import isEqual from 'lodash.isequal';
import React, { ReactElement } from 'react';
import { copyObject } from '@/utils/utils';

export const MIN_DRAG_LENGTH = 10; // 最小的拖拽效果下的长度
export const MAX_STACK_LENGTH = -10; // 保存最大回撤操作距离
export const DEFAULT_BOUND = {
    max_x: undefined,
    min_x: undefined,
    min_y: undefined,
    max_y: undefined
};

export function calcBoundBorder(
    bound?: [number, number?, number?, number?]
): [number, number, number, number] {
    if (bound) {
        switch (bound.length) {
            case 1:
                return [bound[0], bound[0], bound[0], bound[0]];
            case 2:
                return [
                    bound[0],
                    bound[1] as number,
                    bound[0],
                    bound[1] as number
                ];
            case 3:
                return [
                    bound[0],
                    bound[1] as number,
                    bound[2] as number,
                    bound[1] as number
                ];
            case 4:
                return [
                    bound[0],
                    bound[1] as number,
                    bound[2] as number,
                    bound[3] as number
                ];
        }
    }
    return [0, 0, 0, 0];
}

export function calcBoundRange(
    props: CanvasProps,
    bound_border: [number, number, number, number]
) {
    const { width, height } = props;

    return {
        max_x: width - bound_border[1] - bound_border[3],
        min_x: 0,
        min_y: 0,
        max_y: height - bound_border[0] - bound_border[2]
    };
}

interface Position {
    x: number;
    y: number;
    w: number;
    h: number;
}

// != undefined 处理一下 有0也是false的情况
export function calcBoundPositions<
    T extends Position | { x: number; y: number }
>(
    pos: T,
    bound?: Partial<{
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
    }>
): T {
    if (bound) {
        const { min_x, max_x, min_y, max_y } = bound;
        if (min_x != undefined && pos.x < min_x) {
            pos.x = min_x;
        }
        if (max_x != undefined && pos.x > max_x) {
            pos.x = max_x;
        }
        if (min_y != undefined && pos.y < min_y) {
            pos.y = min_y;
        }
        if (max_y != undefined && pos.y > max_y) {
            pos.y = max_y;
        }
        if (
            max_x != undefined &&
            min_x != undefined &&
            (pos as Position).w != undefined &&
            (pos as Position).w > max_x - pos.x
        ) {
            (pos as Position).w = max_x - pos.x;
        }
        if (
            max_y != undefined &&
            min_y != undefined &&
            (pos as Position).h != undefined &&
            (pos as Position).h > max_y - pos.y
        ) {
            (pos as Position).h = max_y - pos.y;
        }
    }
    return pos;
}

export function snapToGrid(pos: ItemPos, grid?: [number, number]) {
    if (grid && !pos.is_float) {
        pos.x = Math.round(pos.x / grid[0]) * grid[0];
        pos.y = Math.round(pos.y / grid[1]) * grid[1];
        pos.w = Math.round(pos.w / grid[0]) * grid[0];
        pos.h = Math.round(pos.h / grid[1]) * grid[1];
        return pos;
    }
    return pos;
}

export function gridToDrag(widget: ItemPos, grid?: [number, number]): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        if (grid) {
            return {
                x: widget.x * grid[0],
                y: widget.y * grid[1],
                w: widget.w * grid[0],
                h: widget.h * grid[1],
                is_float: false,
                i: widget.i
            };
        } else {
            return { x: 0, y: 0, h: 0, w: 0, is_float: false, i: widget.i };
        }
    }
}

export function dragToGrid(widget: ItemPos, grid?: [number, number]): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        if (grid) {
            return {
                x: Math.ceil(widget.x / grid[0]),
                y: Math.ceil(widget.y / grid[1]),
                w: Math.ceil(widget.w / grid[0]),
                h: Math.ceil(widget.h / grid[1]),
                is_float: false,
                i: widget.i
            };
        } else {
            return { x: 0, y: 0, h: 0, w: 0, is_float: false, i: widget.i };
        }
    }
}

export function dynamicProgramming2(
    item: ItemPos,
    widgets: LayoutItem[],
    grid: [number, number],
    grid_bound?: Partial<{
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
    }>
) {
    let shadow_pos = calcBoundPositions(
        snapToGrid(copyObject(item), grid),
        grid_bound
    );
    const sort_widgets = widgets
        .filter((w) => !w.is_float && w.i !== item.i)
        .concat([shadow_pos])
        .sort((a, b) => b.y - a.y);

    const footer_widgets: { [key: number]: LayoutItem[] } = {};

    function removeFooterWidget(widget: LayoutItem) {
        let offset_x = widget.x;
        while (offset_x < widget.x + widget.w) {
            footer_widgets[offset_x]?.pop();
            offset_x += grid[0];
        }
    }

    function checkUpWidets(cur_widget: LayoutItem) {
        let offset_y = 0;
        let offset_x = cur_widget.x;
        const check_range = cur_widget.x + cur_widget.w;
        while (offset_x < check_range) {
            if (!footer_widgets[offset_x]) footer_widgets[offset_x] = [];

            const up_widgets = footer_widgets[offset_x];
            if (up_widgets && up_widgets.length) {
                const up_widget = up_widgets[up_widgets.length - 1];
                if (up_widget === cur_widget) {
                    offset_x += grid[0];
                    continue;
                }

                // 检测与拖拽元素碰撞的移动位置
                // 其余情况依次往下排列
                if ([up_widget.i, cur_widget.i].includes(item.i)) {
                    let need_move = false;

                    // 当前元素偏移量小于等于上方元素
                    need_move =
                        cur_widget.y <= up_widget.y && up_widget.i !== item.i;

                    // 处理特殊情况，移动的元素比下方元素大很多
                    need_move =
                        up_widget.i === item.i &&
                        item.y - up_widget.y > cur_widget.h;

                    if (need_move) {
                        // 当前元素向上移动
                        // 把上一个元素移除，放到sort_widgets栈中，重新排列
                        // 重置检测点 重新检测
                        sort_widgets.push(up_widget);
                        removeFooterWidget(up_widget);
                        up_widget.y += cur_widget.h;
                        offset_y = 0;
                        offset_x = cur_widget.x;
                        continue;
                    }
                }

                up_widgets.push(cur_widget);
                offset_y = Math.max(offset_y, up_widget.y + up_widget.h);
            } else {
                up_widgets.push(cur_widget);
            }
            offset_x += grid[0];
        }

        cur_widget.y = offset_y;
    }

    while (sort_widgets.length) {
        const cur_widget = sort_widgets.pop();
        if (cur_widget) checkUpWidets(cur_widget);
    }

    const layout = widgets;
    return { layout, shadow_pos };
}

export function dynamicProgramming(
    widgets: any,
    grid?: [number, number],
    grid_bound?: Partial<{
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
    }>
) {
    // console.log(widgets);
    return widgets;
}

export function createInitialLayout(
    children: React.ReactElement[],
    grid?: [number, number]
) {
    return children.map((child) => {
        const item = child.props['data-drag'] as LayoutItem;
        return {
            ...gridToDrag(item, grid),
            is_float: item.is_float ? item.is_float : false,
            is_draggable: item.is_draggable ? item.is_draggable : false,
            is_resizable: item.is_resizable ? item.is_resizable : false
        };
    });
}

export function childrenEqual(a: ReactElement, b: ReactElement): boolean {
    return isEqual(
        React.Children.map(a, (c) => c?.key),
        React.Children.map(b, (c) => c?.key)
    );
}

export function compareProps<T>(prev: Readonly<T>, next: Readonly<T>): boolean {
    return !Object.keys(prev)
        .map((key) => {
            if (
                [
                    'setCurrentChecked',
                    'onDragStart',
                    'onDrag',
                    'onDragStop',
                    'onResizeStart',
                    'onResize',
                    'onResizeStop',
                    'onPositionChange'
                ].includes(key)
            ) {
                return true;
            } else if (key === 'children') {
                return childrenEqual(prev['children'], next['children']);
            } else {
                const is_equal = isEqual(prev[key], next[key]);
                !is_equal && console.log(is_equal, key);
                return isEqual(prev[key], next[key]);
            }
        })
        .some((state) => state === false);
}

export function getDropPos(
    e: React.MouseEvent,
    props: CanvasProps,
    grid: [number, number]
): ItemPos {
    const { layerX, layerY } = e.nativeEvent as any;
    const x = layerX / props.scale;
    const y = layerY / props.scale;

    return {
        x,
        y,
        w: grid[0],
        h: grid[1],
        i: Math.random().toString(),
        is_float: props.layout_type === LayoutType.GRID ? false : true
    };
}

export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
    if (l1.i === l2.i) return false; // same element
    if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
    if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
    if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
    if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
    return true; // boxes overlap
}
