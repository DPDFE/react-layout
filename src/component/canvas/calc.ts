import {
    CanvasProps,
    LayoutItem,
    ItemPos,
    LayoutType,
    GridType,
    BoundType
} from '@/interfaces';
import { copyObject } from '@/utils/utils';
import React from 'react';
import { clamp } from './draggable';

export const MIN_DRAG_LENGTH = 10; // 最小的拖拽效果下的长度

interface Position {
    x: number;
    y: number;
    w: number;
    h: number;
}

export function calcBoundPositions<T extends Position>(
    pos: T,
    bound: BoundType
): T {
    if (bound) {
        const { max_x, max_y, min_x, min_y } = bound;
        pos.x = clamp(pos.x, min_x, max_x);
        pos.y = clamp(pos.y, min_y, max_y);
        pos.w = Math.min(pos.w, max_x - pos.x);
        pos.h = Math.min(pos.h, max_y - pos.y);
    }
    return pos;
}

export function snapToGrid(pos: ItemPos, grid: GridType) {
    pos.x = Math.round(pos.x / grid.col_width) * grid.col_width;
    pos.y = Math.round(pos.y / grid.row_height) * grid.row_height;
    pos.w = Math.round(pos.w / grid.col_width) * grid.col_width;
    pos.h = Math.round(pos.h / grid.row_height) * grid.row_height;
    return pos;
}

export function gridToDrag(widget: ItemPos, grid?: GridType): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        if (grid) {
            return {
                ...widget,
                x: widget.x * grid.col_width,
                y: widget.y * grid.row_height,
                w: widget.w * grid.col_width,
                h: widget.h * grid.row_height
            };
        } else {
            return { ...widget, x: 0, y: 0, h: 0, w: 0 };
        }
    }
}

export function dragToGrid(widget: ItemPos, grid?: GridType): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        if (grid) {
            return {
                ...widget,
                x: Math.ceil(widget.x / grid.col_width),
                y: Math.ceil(widget.y / grid.row_height),
                w: Math.ceil(widget.w / grid.col_width),
                h: Math.ceil(widget.h / grid.row_height)
            };
        } else {
            return {
                ...widget,
                x: 0,
                y: 0,
                h: 0,
                w: 0
            };
        }
    }
}

export function dynamicProgramming(
    item: ItemPos,
    widgets: LayoutItem[],
    grid: GridType
) {
    let shadow_pos = snapToGrid(copyObject(item), grid);
    const sort_widgets = widgets
        .filter((w) => !w.is_float && w.i !== item.i)
        .concat([shadow_pos])
        .sort((a, b) => b.y - a.y);

    const footer_widgets: { [key: number]: LayoutItem[] } = {};

    function removeFooterWidget(widget: LayoutItem) {
        let offset_x = widget.x;
        while (offset_x < widget.x + widget.w) {
            footer_widgets[offset_x]?.pop();
            offset_x += grid.col_width;
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
                    offset_x += grid.col_width;
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
            offset_x += grid.row_height;
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

export function createInitialLayout(
    children: React.ReactElement[],
    grid: GridType
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

export function getDropPos(e: React.MouseEvent, props: CanvasProps): ItemPos {
    const { scale, grid, bound, layout_type } = props;

    const { layerX, layerY } = e.nativeEvent as any;
    const x = layerX / scale;
    const y = layerY / scale;

    const w = grid.col_width * 1;
    const h = grid.row_height * 1;

    const pos = { i: '-1', x, y, w, h, is_float: true };

    if (layout_type === LayoutType.GRID) {
        snapToGrid(pos, grid);
        const { max_x, max_y, min_x, min_y } = bound;
        pos.x = clamp(pos.x, min_x, max_x - w);
        pos.y = clamp(pos.y, min_y, max_y - h);
    }

    return pos;
}

export function collides(item_1: LayoutItem, item_2: LayoutItem): boolean {
    if (item_1.i === item_2.i) return false; // 相同节点
    if (item_1.x + item_1.w <= item_2.x) return false; // 👈
    if (item_1.x >= item_2.x + item_2.w) return false; // 👉
    if (item_1.y + item_1.h <= item_2.y) return false; // 👆
    if (item_1.y >= item_2.y + item_2.h) return false; // 👇
    return true;
}

function getFirstCollision(layout: LayoutItem[], item: LayoutItem) {
    return layout.find((l) => {
        return collides(l, item);
    });
}

function sortLayoutItems(layout: LayoutItem[]) {
    return layout
        .filter((l) => {
            return !l.is_float;
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

function bottom(layout: LayoutItem[]) {
    let max = 0,
        bottomY;
    for (let i = 0, len = layout.length; i < len; i++) {
        bottomY = layout[i].y + layout[i].h;
        if (bottomY > max) max = bottomY;
    }
    return max;
}

function resolveCompactionCollision(
    layout: LayoutItem[],
    item: LayoutItem,
    move_to: number,
    col_height: number
) {
    item.y += col_height;
    const item_index = layout
        .map((layoutItem) => {
            return layoutItem.i;
        })
        .indexOf(item.i);

    for (let i = item_index + 1; i < layout.length; i++) {
        const l = layout[i];
        if (l.y > item.y + item.h) {
            break;
        }
        if (collides(item, l)) {
            resolveCompactionCollision(layout, l, move_to + item.h, col_height);
        }
    }
    item.y = move_to;
}

function compactItem(
    compare_with: LayoutItem[],
    l: LayoutItem,
    sorted: LayoutItem[],
    row_height: number
) {
    l.y = Math.min(bottom(compare_with), l.y);
    while (l.y > 0 && !getFirstCollision(compare_with, l)) {
        l.y -= row_height;
    }

    let collides;
    while ((collides = getFirstCollision(compare_with, l))) {
        resolveCompactionCollision(
            sorted,
            l,
            collides.y + collides.h,
            row_height
        );
    }

    l.y = Math.max(l.y, 0);
    l.x = Math.max(l.x, 0);
    return l;
}

export function compact(layout: LayoutItem[], row_height: number) {
    const compare_with: LayoutItem[] = [];
    const sorted = sortLayoutItems(layout);

    sorted.map((l) => {
        l = compactItem(compare_with, l, sorted, row_height);
        compare_with.push(l);
    });
}
