import { WidgetItemProps } from '@/interfaces';
import isEqual from 'lodash.isequal';
import React, { memo, ReactElement, useRef, useState } from 'react';
import { MIN_DRAG_LENGTH, snapToDragBound } from '../layout/calc';
import Draggable, { clamp } from './draggable';
import Resizable from './resizable';
import styles from './styles.module.css';

/**
 * WidgetItem、resizable、draggable（props、child）流转：
 * WidgetItem:
 * child: 调用方child
 * props: Canvas props
 *
 * draggable:
 * child: WidgetItem
 * props: resizable props
 *
 * resizable:
 * child: draggable
 * props: WidgetItem props
 */
const WidgetItem = React.forwardRef((props: WidgetItemProps, ref) => {
    const child = React.Children.only(props.children);
    const item_ref = ref ?? useRef<HTMLDivElement>(null);

    const { col_width, row_height } = props.grid;

    const { i, is_float, is_dragging, is_draggable, is_resizable } = props;

    const { min_x, max_x, min_y, max_y } = snapToDragBound(
        props.bound,
        props.grid,
        is_float
    );

    const gridX = (count: number) => {
        return is_float || is_dragging ? count : count * col_width;
    };
    const gridY = (count: number) => {
        return is_float || is_dragging ? count : count * row_height;
    };

    const margin_height = is_float ? 0 : props.margin[0];
    const margin_width = is_float ? 0 : props.margin[1];

    const offset_x = is_float ? 0 : Math.max(margin_width, props.padding.left);
    const offset_y = is_float ? 0 : Math.max(margin_height, props.padding.top);

    const w = Math.max(gridX(props.w) - margin_width, 0);
    const h = Math.max(gridY(props.h) - margin_height, 0);

    const x = clamp(gridX(props.x) + offset_x, min_x, max_x - w);
    const y = clamp(gridY(props.y) + offset_y, min_y, max_y - h);

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const keycode_step = 3;

        switch (e.keyCode) {
            case 37: // ArrowLeft
                return {
                    x: x - keycode_step
                };

            case 38: // ArrowUp
                return {
                    y: y - keycode_step
                };

            case 39: // ArrowRight
                return {
                    x: x + keycode_step
                };

            case 40: // ArrowDown
                return {
                    y: y + keycode_step
                };
        }
        return undefined;
    };

    const new_child = React.cloneElement(child, {
        tabIndex: i,
        onMouseDown: () => {
            props.setCurrentChecked?.(i);
        },
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        onDragLeave: (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        onDragEnter: (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        onKeyDown: (e: React.KeyboardEvent) => {
            if (is_float) {
                const keydown_pos = handleKeyDown(e);
                if (keydown_pos) {
                    props.onPositionChange?.({
                        ...{ x, y, h, w, i, is_float },
                        ...keydown_pos
                    });
                }
            }
        },
        ref: item_ref,
        id: `${
            child.props.id
                ? child.props.id + ' layout_item_' + i
                : 'layout_item_' + i
        }`,
        className: `${[
            child.props.className,
            styles.layout_item,
            props.is_checked
                ? styles['light-theme-border']
                : styles['no-border']
        ].join(' ')}`,
        style: {
            transform: `translate(${x}px, ${y}px)`,
            transition: props.is_checked ? 'none' : 'all 0.1s linear',
            pointerEvents: props.covered
                ? 'none'
                : 'auto' /* 处理iframe不响应mousemove事件 */,
            width: w,
            height: h,
            ...child.props.style
        }
    });
    console.log('render', i);

    /**
     * 获取模块最小范围
     */
    const getCurrentGrid = () => {
        if (is_float) {
            return {
                col_width: props.min_w ?? MIN_DRAG_LENGTH,
                row_height: props.min_h ?? MIN_DRAG_LENGTH
            };
        } else {
            return {
                col_width: (props.min_w ?? 1) * col_width,
                row_height: (props.min_h ?? 1) * row_height
            };
        }
    };

    return (
        <React.Fragment>
            <Resizable
                {...{ x, y, h, w, i, is_float }}
                scale={props.scale}
                is_resizable={is_resizable}
                onResizeStart={() => {
                    props.onResizeStart?.();
                }}
                onResize={({ x, y, h, w }) => {
                    props.onResize?.({
                        x: x - offset_x,
                        y: y - offset_y,
                        w: w + margin_width,
                        h: h + margin_height,
                        is_float,
                        i
                    });
                }}
                grid={getCurrentGrid()}
                bound={{ max_x, max_y, min_x, min_y }}
                onResizeStop={({ x, y, h, w }) => {
                    props.onResizeStop?.({
                        x: x - offset_x,
                        y: y - offset_y,
                        w: w + margin_width,
                        h: h + margin_height,
                        is_float,
                        i
                    });
                }}
            >
                <Draggable
                    {...{ x, y, h, w, i, is_float }}
                    scale={props.scale}
                    is_draggable={is_draggable}
                    onDragStart={() => {
                        props.onDragStart?.();
                    }}
                    bound={{
                        max_y: max_y - h,
                        min_y,
                        max_x: max_x - w,
                        min_x
                    }}
                    onDrag={({ x, y }) => {
                        props.onDrag?.({
                            x: x - offset_x,
                            y: y - offset_y,
                            w: w + margin_width,
                            h: h + margin_height,
                            is_float,
                            i
                        });
                    }}
                    onDragStop={({ x, y }) => {
                        props.onDragStop?.({
                            x: x - offset_x,
                            y: y - offset_y,
                            w: w + margin_width,
                            h: h + margin_height,
                            is_float,
                            i
                        });
                    }}
                >
                    {new_child}
                </Draggable>
            </Resizable>
        </React.Fragment>
    );
});

WidgetItem.defaultProps = {
    scale: 1,
    is_float: false,
    is_checked: false,
    style: {},
    margin: [0, 0] as [number, number]
};

export default memo(WidgetItem, compareProps);

function compareProps<T>(prev: Readonly<T>, next: Readonly<T>): boolean {
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
            } else {
                !isEqual(prev[key], next[key]) &&
                    console.log(key, prev[key], next[key]);
                return isEqual(prev[key], next[key]);
            }
        })
        .some((state) => state === false);
}

export function childrenEqual(a: ReactElement, b: ReactElement): boolean {
    return isEqual(
        React.Children.map(a, (c) => c?.key),
        React.Children.map(b, (c) => c?.key)
    );
}
