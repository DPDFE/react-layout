import { LayoutType, WidgetItemProps } from '@/interfaces';
import isEqual from 'lodash.isequal';
import React, { Fragment, memo, ReactElement, useContext, useRef } from 'react';
import { MIN_DRAG_LENGTH, snapToDragBound } from '../layout/calc';
import { LayoutContext } from '../layout/context';
import Draggable, { clamp, DEFAULT_BOUND } from './draggable';
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

    const { operator_type } = useContext(LayoutContext);

    const { col_width, row_height } = props.grid;

    const {
        i,
        is_float,
        is_dragging,
        is_draggable,
        is_resizable,
        need_mask,
        layout_nested
    } = props;

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

    // 如果child是一个iframe，就是一个黑洞，用遮罩把黑洞填上
    const mask_dom = (
        <div
            key={'mask'}
            className={`react-drag-item-mask`}
            style={{
                border: 'none',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        ></div>
    );

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
            pointerEvents: operator_type
                ? 'none'
                : 'auto' /* 处理iframe不响应mousemove事件 */,
            width: w,
            height: h,
            ...child.props.style
        },
        children:
            props.mode === LayoutType.edit && need_mask
                ? [child.props.children, mask_dom]
                : child.props.children
    });

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
        <Draggable
            {...{ x, y, h, w, i, is_float }}
            scale={props.scale}
            is_draggable={is_draggable}
            onDragStart={() => {
                props.onDragStart?.();
            }}
            bound={
                layout_nested
                    ? DEFAULT_BOUND
                    : {
                          max_y: max_y - h,
                          min_y,
                          max_x: max_x - w,
                          min_x
                      }
            }
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
            <Resizable
                ref={item_ref}
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
                {new_child}
            </Resizable>
        </Draggable>
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
                    'data-drag',
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
                // if (key === 'children' && !isEqual(prev[key], next[key])) {
                //     return childrenEqual(prev['children'], next['children']);
                // }
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
