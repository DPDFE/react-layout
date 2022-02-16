import {
    CanvasProps,
    LayoutItem,
    ItemPos,
    LayoutType,
    BoundType
} from '@/interfaces';
import isEqual from 'lodash.isequal';
import React, { ReactElement } from 'react';

export const MIN_DRAG_LENGTH = 10; // 最小的拖拽效果下的长度
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

export function collides(item_1: LayoutItem, item_2: LayoutItem): boolean {
    if (item_1.i === item_2.i) return false; // 相同节点
    if (item_1.x + item_1.w <= item_2.x) return false; // 👈
    if (item_1.x >= item_2.x + item_2.w) return false; // 👉
    if (item_1.y + item_1.h <= item_2.y) return false; // 👆
    if (item_1.y >= item_2.y + item_2.h) return false; // 👇
    return true;
}

export function sortGridLayoutItems(layout: LayoutItem[]) {
    return layout
        .slice(0)
        .filter((l) => {
            return !l.is_float;
        })
        .sort(function (a, b) {
            if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
                return 1;
            } else if (a.y === b.y && a.x === b.x) {
                // Without this, we can get different sort results in IE vs. Chrome/FF
                return 0;
            }
            return -1;
        });
}

function getAllCollisions(layout: LayoutItem[], item: LayoutItem) {
    return layout.filter((l) => collides(l, item));
}

function findItemPos(layout: LayoutItem[], item: LayoutItem): LayoutItem {
    let y = 0;
    layout.map((l) => {
        if (item.x > l.x && item.x < l.x + l.w) {
            if (item.y > l.y && item.y < l.y + l.h) {
                if (item.y > l.y + l.h / 2) {
                    y = Math.max(l.y + l.h, y);
                } else {
                    y = Math.max(l.y, y);
                }
            }
        }
    });

    console.log(item, y);
    return { ...item, y };
}

export function dynamicCalcShadowPos(
    layout: LayoutItem[],
    grid: [number, number],
    item_bound: Partial<BoundType>,
    center_widget: LayoutItem
) {
    const item_pos = findItemPos(layout, center_widget);
    const shadow_pos = calcBoundPositions(
        snapToGrid(item_pos, grid),
        item_bound
    );
    // console.log(item_pos);
    return { shadow_pos };
}

// 如果有center_widget，说明有当前操作节点，需要针对当前节点，计算放置位置，作为shadow_widget的position
// 如果没有center_widget，先过滤layout中的非浮动节点。
// 非浮动节点进行排位，如果有挤压，进行重新定位。

// 非浮动放置规则 向上挤压
export function dynamicCalcLayout(
    layout: LayoutItem[],
    grid: [number, number] | undefined,
    item_bound: Partial<BoundType>,
    center_widget: LayoutItem
) {
    // const collisions = getAllCollisions(layout, { ...item, y });
    // const has_collisions = collisions.length > 0;
    // if (has_collisions) {
    //     const last_collision = collisions[0];
    //     console.log('last_collision', last_collision);
    //     y =
    //         last_collision.y + last_collision.h / 2 > y
    //             ? last_collision.y + last_collision.h
    //             : last_collision.y;
    // }
    // console.log('final', y);

    // const new_layout = layout!.map((widget) => {
    //     return widget.i === item.i
    //         ? Object.assign(
    //               {},
    //               widget,
    //               is_save && !item.is_float ? shadow_pos : item
    //           )
    //         : widget;
    // });

    const shadow_pos = calcBoundPositions(
        snapToGrid(center_widget, grid),
        item_bound
    );

    return { shadow_pos, new_layout: layout };
}
