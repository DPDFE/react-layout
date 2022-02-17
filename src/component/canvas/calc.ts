import { CanvasProps, LayoutItem, ItemPos, LayoutType } from '@/interfaces';
import React from 'react';

export const MIN_DRAG_LENGTH = 10; // 最小的拖拽效果下的长度

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
        if (min_x != undefined && max_x != undefined) {
            pos.x = Math.min(Math.max(min_x, pos.x), max_x);
        }
        if (min_y != undefined && max_y != undefined) {
            pos.y = Math.min(Math.max(min_y, pos.y), max_y);
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

export function snapToGrid(pos: ItemPos, grid: [number, number]) {
    pos.x = Math.round(pos.x / grid[0]) * grid[0];
    pos.y = Math.round(pos.y / grid[1]) * grid[1];
    pos.w = Math.round(pos.w / grid[0]) * grid[0];
    pos.h = Math.round(pos.h / grid[1]) * grid[1];
    return pos;
}

export function gridToDrag(widget: ItemPos, grid?: [number, number]): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        if (grid) {
            return {
                ...widget,
                x: widget.x * grid[0],
                y: widget.y * grid[1],
                w: widget.w * grid[0],
                h: widget.h * grid[1]
            };
        } else {
            return { ...widget, x: 0, y: 0, h: 0, w: 0 };
        }
    }
}

export function dragToGrid(widget: ItemPos, grid?: [number, number]): ItemPos {
    if (widget.is_float) {
        return widget as ItemPos;
    } else {
        if (grid) {
            return {
                ...widget,
                x: Math.ceil(widget.x / grid[0]),
                y: Math.ceil(widget.y / grid[1]),
                w: Math.ceil(widget.w / grid[0]),
                h: Math.ceil(widget.h / grid[1])
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

export function getDropPos(e: React.MouseEvent, props: CanvasProps): ItemPos {
    const { scale, grid, bound, layout_type } = props;

    const { layerX, layerY } = e.nativeEvent as any;
    const x = layerX / scale;
    const y = layerY / scale;

    if (layout_type === LayoutType.GRID) {
        return calcBoundPositions(
            snapToGrid(
                {
                    x,
                    y,
                    w: grid[0],
                    h: grid[1],
                    i: Math.random().toString(),
                    is_float: false
                },
                grid
            ),
            bound
        );
    } else {
        return {
            x,
            y,
            w: grid[0],
            h: grid[1],
            i: Math.random().toString(),
            is_float: true
        };
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

/**
 * 获取布局上所有和目标元素重叠的元素
 * @param layout
 * @param item
 * @returns
 */
function getAllCollisions(layout: LayoutItem[], item: LayoutItem) {
    return layout
        .filter((l) => {
            return !l.is_float;
        })
        .filter((l) => collides(l, item));
}

/**
 * 获取正确定位
 * @param layout
 * @param item
 * @returns
 */
export function findItemPos(layout: LayoutItem[], item: LayoutItem) {
    let y = 0;
    layout.map((l) => {
        if (!l.is_float) {
            if (item.x >= l.x && item.x < l.x + l.w) {
                if (item.y > l.y + l.h / 2) {
                    console.log('down', item, l);
                    y = Math.max(l.y + l.h, y);
                } else if (item.y > l.y) {
                    console.log('up');
                    y = Math.max(l.y, y);
                }
            }
        }
    });
    item.y = y;
}

/**
 * 有碰撞，一直找到has_collisions没有了就停止
 * center_widget是正确元素，collisions为重叠元素
 * @param layout
 * @param center_widget
 */
export function moveElement(layout: LayoutItem[], center_widget: LayoutItem) {
    findItemPos(layout, center_widget);
    const collisions = getAllCollisions(layout, center_widget);
    const has_collisions = collisions.length > 0;
    if (has_collisions) {
        collisions.map((col) => {
            // moveElement(layout, col);
        });
    }
}

/**
 * 保证初始化状态widget不重叠
 * @param layout 用户定位布局
 * @returns
 */
export function dynamicCalcLayout(layout: LayoutItem[]) {
    console.log('dynamicCalcLayout start');
    layout.map((l) => {
        if (!l.is_float) {
            findItemPos(layout, l);
            moveElement(layout, l);
        }
        return l;
    });
    return layout;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(value, Math.max(value, min), max);
}
