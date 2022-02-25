import {
    LayoutItem,
    ItemPos,
    LayoutType,
    GridType,
    EditLayoutProps,
    ReactDragLayoutProps,
    BoundType,
    DragLayoutProps,
    MarginType,
    GridLayoutProps
} from '@/interfaces';
import { copyObject, copyObjectArray } from '@/utils/utils';
import React, { RefObject } from 'react';

export const RULER_GAP = 100; // 标尺间隔大小
export const TOP_RULER_LEFT_MARGIN = 15; //顶部标尺左侧间隔
export const WRAPPER_PADDING = 200; // 编辑状态下的边框

export const MIN_DRAG_LENGTH = 10; // 最小的拖拽效果下的长度

export function snapToGrid(pos: ItemPos, grid: GridType) {
    pos.x = Math.round(pos.x / grid.col_width) * grid.col_width;
    pos.y = Math.round(pos.y / grid.row_height) * grid.row_height;
    pos.w = Math.round(pos.w / grid.col_width) * grid.col_width;
    pos.h = Math.round(pos.h / grid.row_height) * grid.row_height;
    return pos;
}

export function dragToGrid(widget: ItemPos, grid: GridType): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        return {
            ...widget,
            x: Math.ceil(widget.x / grid.col_width),
            y: Math.ceil(widget.y / grid.row_height),
            w: Math.ceil(widget.w / grid.col_width),
            h: Math.ceil(widget.h / grid.row_height)
        };
    }
}

export function dynamicProgramming(
    item: ItemPos,
    widgets: LayoutItem[],
    grid: GridType,
    margin: [number, number]
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

export const getCurrentMouseOverWidget = (
    layout: LayoutItem[],
    canvas_ref: RefObject<HTMLElement>,
    e: React.MouseEvent,
    scale: number
) => {
    const { x, y } = getDropPosition(canvas_ref, e, scale);
    const fake_item = {
        i: 'drop_fake_item',
        x,
        y,
        w: 10,
        h: 10,
        is_float: true
    };
    const collides = getFirstCollision(layout!, fake_item);
    return collides;
};

export function getDropPosition(
    canvas_ref: RefObject<HTMLElement>,
    e: React.MouseEvent,
    scale: number
) {
    const current = (canvas_ref as RefObject<HTMLElement>).current!;

    const { left, top } = current.getBoundingClientRect();
    const x = (e.clientX + current.scrollLeft - left) / scale;
    const y = (e.clientY + current.scrollTop - top) / scale;
    return { x, y };
}

export function getDropItem(
    canvas_ref: RefObject<HTMLElement>,
    e: React.MouseEvent,
    props: ReactDragLayoutProps,
    grid: GridType
): ItemPos {
    const { scale, layout_type } = props;
    const { x, y } = getDropPosition(canvas_ref, e, scale);

    const drop_item = (props as EditLayoutProps).getDroppingItem?.();

    const i = drop_item ? drop_item.i : '__dropping_item__';

    if (layout_type === LayoutType.GRID) {
        const w = grid.col_width * (drop_item ? drop_item.w : 2);
        const h = grid.row_height * (drop_item ? drop_item.h : 2);

        const pos = { w, h, i, x, y, is_float: false };

        snapToGrid(pos, grid);

        return pos;
    } else {
        const w = drop_item ? drop_item.w : 100;
        const h = drop_item ? drop_item.h : 100;

        return { w, h, i, x, y, is_float: true };
    }
}

export function collides(item_1: LayoutItem, item_2: LayoutItem): boolean {
    if (item_1.i === item_2.i) return false; // 相同节点
    if (item_1.x + item_1.w <= item_2.x) return false; // 👈
    if (item_1.x >= item_2.x + item_2.w) return false; // 👉
    if (item_1.y + item_1.h <= item_2.y) return false; // 👆
    if (item_1.y >= item_2.y + item_2.h) return false; // 👇
    return true;
}

export function getFirstCollision(layout: LayoutItem[], item: LayoutItem) {
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
    row_height: number
) {
    item.y += row_height;
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
            resolveCompactionCollision(layout, l, move_to + item.h, row_height);
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

    while (l.y > 0) {
        if (getFirstCollision(compare_with, l)) {
            break;
        } else {
            l.y -= row_height;
        }
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
    console.log(sorted);
    sorted.map((l) => {
        l.moved = false;
        l = compactItem(compare_with, l, sorted, row_height);
        compare_with.push(l);
    });
}

function getAllCollisions(sorted: LayoutItem[], item: LayoutItem) {
    return sorted.filter((l) => collides(l, item));
}

function moveElementAwayFromCollision(
    layout: LayoutItem[],
    l: LayoutItem,
    collision: LayoutItem,
    row_height: number
) {
    const fake_item: LayoutItem = {
        x: collision.x,
        y: Math.max(l.y - collision.h, 0),
        w: collision.w,
        h: collision.h,
        i: 'fake_item',
        is_float: false
    };

    const _collision = getFirstCollision(layout, fake_item);
    if (_collision) {
        return moveElement(
            layout,
            collision,
            collision.x,
            collision.y + row_height,
            row_height
        );
    } else {
        return moveElement(
            layout,
            collision,
            collision.x,
            fake_item.y,
            row_height
        );
    }
}

export function moveElement(
    layout: LayoutItem[],
    l: LayoutItem,
    x: number,
    y: number,
    row_height: number
) {
    const old_y = l.y;
    l.x = x;
    l.y = y;
    l.moved = true;

    let sorted = sortLayoutItems(layout);
    if (old_y > l.y) sorted = sorted.reverse();

    const collisions = getAllCollisions(sorted, l);

    for (let i = 0, len = collisions.length; i < len; i++) {
        const collision = collisions[i];

        if (collision.moved) {
            continue;
        }

        layout = moveElementAwayFromCollision(sorted, l, collision, row_height);
    }
    return layout;
}

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

export function calcOffset(client: number, calc: number) {
    return client - calc > 0 ? (client - calc) / 2 : 0;
}

export function getMaxLayoutBound(children: LayoutItem[]) {
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
