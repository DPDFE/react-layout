import {
    LayoutItem,
    ItemPos,
    GridType,
    MarginType,
    BoundType
} from '@/interfaces';
import React, { RefObject } from 'react';

export const RULER_GAP = 100; // 标尺间隔大小
export const TOP_RULER_LEFT_MARGIN = 15; //顶部标尺左侧间隔
export const WRAPPER_PADDING = 200; // 编辑状态下的边框

export const MIN_DRAG_LENGTH = 10; // 最小的拖拽效果下的长度

export function snapToGrid(pos: LayoutItem, grid: GridType) {
    const { row_height, col_width } = grid;

    pos.is_dragging = false;
    pos.x = Math.round(pos.x / col_width);
    pos.y = Math.round(pos.y / row_height);
    pos.w = Math.round(pos.w / col_width);
    pos.h = Math.round(pos.h / row_height);
    return pos;
}

export function snapToDrag(l: LayoutItem, grid: GridType) {
    const { x, y, w, h, is_float, is_dragging } = l;
    const { row_height, col_width } = grid;
    if (is_float || is_dragging) {
        return l;
    }

    return {
        ...l,
        x: x * col_width,
        y: y * row_height,
        w: w * col_width,
        h: h * row_height
    };
}

export function snapToDragBound(
    pos: BoundType,
    grid: GridType,
    is_float: boolean
) {
    const { row_height, col_width } = grid;

    if (is_float) {
        return pos;
    }

    return {
        min_x: pos.min_x * col_width,
        min_y: pos.min_y * row_height,
        max_x: pos.max_x * col_width,
        max_y: pos.max_y * row_height
    };
}

export function moveToWidget(target: LayoutItem, to: ItemPos) {
    target.x = to.x;
    target.y = to.y;
    target.w = to.w;
    target.h = to.h;
}

export function replaceWidget(arr: LayoutItem[], item?: LayoutItem) {
    return item
        ? arr.map((obj) => [item].find((o) => o.i === obj.i) || obj)
        : arr;
}
export function cloneWidget(w: LayoutItem) {
    return {
        ...w
    };
}

export const getCurrentMouseOverWidget = (
    layout: LayoutItem[],
    canvas_ref: RefObject<HTMLElement>,
    e: React.MouseEvent,
    scale: number,
    grid: GridType
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
    const current_layout = layout.map((l) => {
        return snapToDrag(l, grid);
    });
    const collides = getFirstCollision(current_layout, fake_item);
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

function sortGridLayoutItems(layout: LayoutItem[]) {
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

function compactItem(
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

    l.y = Math.max(l.y, 0);
    l.x = Math.max(l.x, 0);
    return l;
}

export function compact(layout: LayoutItem[]) {
    const compare_with: LayoutItem[] = [];
    const sorted = sortGridLayoutItems(layout);

    sorted.map((l) => {
        l.moved = false;
        l = compactItem(compare_with, l, sorted);
        compare_with.push(l);
    });
}

export function getAllCollisions(sorted: LayoutItem[], item: LayoutItem) {
    return sorted.filter((l) => collides(l, item));
}

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
        is_float: false
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

export function moveElement(
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

export function calcOffset(client: number, calc: number) {
    return client - calc > 0 ? (client - calc) / 2 : 0;
}
