import {
    BoundType,
    CursorPointer,
    CursorType,
    ResizableProps
} from '@/interfaces';
import classNames from 'classnames';
import React, { memo, useRef } from 'react';
import Cursor from './cursor';
import { clamp, DEFAULT_BOUND, setTopLeft, setTransform } from './draggable';

const Resizable = React.forwardRef((props: ResizableProps, ref) => {
    const child = React.Children.only(props.children);
    const resize_ref = ref ?? useRef<HTMLDivElement>(null);

    const min_h = props.min_h ?? 0;
    const min_w = props.min_w ?? 0;
    const bound = props.bound ?? DEFAULT_BOUND;
    const cursors = props.cursors ?? [
        CursorType.se,
        CursorType.sw,
        CursorType.ne,
        CursorType.nw
    ];

    const handleResizeStart = (e: MouseEvent) => {
        if (!props.is_resizable) {
            return;
        }
        props.onResizeStart?.(e);
    };

    const handleResize = ({ e, x, y, cursor }: CursorPointer) => {
        const pos = cursor_mappings[cursor].calcPositionByCursor({ x, y });
        props.onResize?.({ ...pos, e });
    };

    const handleResizeStop = ({ e, x, y, cursor }: CursorPointer) => {
        const pos = cursor_mappings[cursor].calcPositionByCursor({ x, y });
        props.onResizeStop?.({ ...pos, e });
    };

    const cursor_mappings = {
        // 上
        [CursorType.n]: {
            x: props.x + props.w / 2,
            y: props.y,
            bound: {
                max_y: props.y + props.h - min_h
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x: props.x,
                        y,
                        w: props.w,
                        h: Math.min(props.y - y + props.h, props.y + props.h)
                    },
                    bound
                );
            }
        },
        // 下
        [CursorType.s]: {
            x: props.x + props.w / 2,
            y: props.y + props.h,
            bound: {
                min_y: props.y + min_h
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x: props.x,
                        y: props.y,
                        w: props.w,
                        h: y - props.y
                    },
                    bound
                );
            }
        },
        // 左
        [CursorType.w]: {
            x: props.x,
            y: props.y + props.h / 2,
            bound: {
                max_x: props.x + props.w - min_w
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x,
                        y: props.y,
                        w: Math.min(props.x - x + props.w, props.x + props.w),
                        h: props.h
                    },
                    bound
                );
            }
        },
        // 右
        [CursorType.e]: {
            x: props.x + props.w,
            y: props.y + props.h / 2,
            bound: {
                min_x: props.x + props.w - min_w
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x: props.x,
                        y: props.y,
                        w: x - props.x,
                        h: props.h
                    },
                    bound
                );
            }
        },
        // 左上
        [CursorType.nw]: {
            x: props.x,
            y: props.y,
            bound: {
                max_y: props.y + props.h - min_h,
                max_x: props.x + props.w - min_w
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x,
                        y,
                        w: Math.min(props.x - x + props.w, props.x + props.w),
                        h: Math.min(props.y - y + props.h, props.y + props.h)
                    },
                    bound
                );
            }
        },
        /* 右上 */
        [CursorType.ne]: {
            x: props.x + props.w,
            y: props.y,
            bound: {
                min_x: props.x + min_w,
                max_y: props.y + props.h - min_h
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x: props.x,
                        y: y,
                        w: x - props.x,
                        h: Math.min(props.y - y + props.h, props.y + props.h)
                    },
                    bound
                );
            }
        },
        /* 左下 */
        [CursorType.sw]: {
            x: props.x,
            y: props.y + props.h,
            bound: {
                max_x: props.x + props.w - min_w,
                min_y: props.y + min_h
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x: x,
                        y: props.y,
                        w: Math.min(props.x - x + props.w, props.x + props.w),
                        h: y - props.y
                    },
                    bound
                );
            }
        },
        /* 右下 */
        [CursorType.se]: {
            x: props.x + props.w,
            y: props.y + props.h,
            bound: {
                min_x: props.x + min_w,
                min_y: props.y + min_h
            },
            calcPositionByCursor: ({ x, y }: { x: number; y: number }) => {
                return calcBoundPositions(
                    {
                        x: props.x,
                        y: props.y,
                        w: x - props.x,
                        h: y - props.y
                    },
                    bound
                );
            }
        }
    };

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation();
            props.onMouseDown?.(e);
            child.props.onMouseDown?.(e);
        },
        props: child.props,
        className: classNames(
            'react-resizable',
            props.className,
            child.props.className
        ),
        ref: resize_ref,
        style: {
            ...(props.use_css_transform
                ? setTransform(props.x, props.y)
                : setTopLeft(props.x, props.y)),
            position: props.use_css_fixed ? 'fixed' : 'absolute',
            width: props.w,
            height: props.h,
            ...child.props.style
        }
    });

    return (
        <React.Fragment>
            {new_child}
            {props.is_resizable &&
                cursors.map((cur) => {
                    return (
                        <Cursor
                            key={cur}
                            style={props.style}
                            scale={props.scale}
                            cursor={cur}
                            x={cursor_mappings[cur].x}
                            y={cursor_mappings[cur].y}
                            use_css_transform={props.use_css_transform}
                            use_css_fixed={props.use_css_fixed}
                            onDragStart={handleResizeStart}
                            onDrag={handleResize}
                            onDragStop={handleResizeStop}
                            bound={cursor_mappings[cur].bound}
                        ></Cursor>
                    );
                })}
        </React.Fragment>
    );
});

export default memo(Resizable);

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
