import {
    BoundType,
    CursorPointer,
    CursorType,
    ResizableProps
} from '@/interfaces';
import React, { memo, useRef } from 'react';
import Cursor from './cursor';
import { clamp, DEFAULT_BOUND } from './draggable';

const Resizable = React.forwardRef((props: ResizableProps, ref) => {
    const child = React.Children.only(props.children);
    const resize_ref = ref ?? useRef<HTMLDivElement>(null);

    const handleResizeStart = () => {
        if (!props.is_resizable) {
            return;
        }
        props.onResizeStart?.();
    };

    const calcPositionByCursor = ({ x, y, cursor }: CursorPointer) => {
        let pos;
        switch (cursor) {
            case CursorType.nw:
                pos = calcBoundPositions(
                    {
                        x,
                        y,
                        w: Math.min(props.x - x + props.w, props.x + props.w),
                        h: Math.min(props.y - y + props.h, props.y + props.h)
                    },
                    props.bound
                );
                return pos;
            case CursorType.ne:
                pos = calcBoundPositions(
                    {
                        x: props.x,
                        y: y,
                        w: x - props.x,
                        h: Math.min(props.y - y + props.h, props.y + props.h)
                    },
                    props.bound
                );
                return pos;
            case CursorType.sw:
                pos = calcBoundPositions(
                    {
                        x: x,
                        y: props.y,
                        w: Math.min(props.x - x + props.w, props.x + props.w),
                        h: y - props.y
                    },
                    props.bound
                );
                return pos;
            case CursorType.se:
                pos = calcBoundPositions(
                    {
                        x: props.x,
                        y: props.y,
                        w: x - props.x,
                        h: y - props.y
                    },
                    props.bound
                );
                return pos;
        }
    };

    const handleResize = ({ x, y, cursor }: CursorPointer) => {
        props.onResize?.(calcPositionByCursor({ x, y, cursor }));
    };

    const handleResizeStop = ({ x, y, cursor }: CursorPointer) => {
        props.onResizeStop?.(calcPositionByCursor({ x, y, cursor }));
    };

    const new_child = React.cloneElement(child, {
        onMouseDown: (e: React.MouseEvent) => {
            props.onMouseDown?.(e);
            child.props.onMouseDown?.(e);
        },
        props: child.props,
        className: `react-resizable ${props.className ? props.className : ''} ${
            child.props.className ? child.props.className : ''
        }`,
        ref: resize_ref,
        style: {
            width: props.w,
            height: props.h,
            ...props.style,
            ...child.props.style
        }
    });

    const { row_height, col_width } = props.grid;

    return (
        <React.Fragment>
            {new_child}
            {props.is_resizable && (
                <React.Fragment>
                    {/* 左上 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.nw}
                        x={props.x}
                        y={props.y}
                        is_dragging={props.is_dragging}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_y: props.y + props.h - row_height,
                            max_x: props.x + props.w - col_width
                        }}
                    ></Cursor>
                    {/* 右上 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.ne}
                        x={props.x + props.w}
                        y={props.y}
                        is_dragging={props.is_dragging}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            min_x: props.x + col_width,
                            max_y: props.y + row_height
                        }}
                    ></Cursor>
                    {/* 左下 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.sw}
                        x={props.x}
                        y={props.y + props.h}
                        is_dragging={props.is_dragging}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w - col_width,
                            min_y: props.y + row_height
                        }}
                    ></Cursor>
                    {/* 右下 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.se}
                        x={props.x + props.w}
                        y={props.y + props.h}
                        is_dragging={props.is_dragging}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            min_x: props.x + col_width,
                            min_y: props.y + row_height
                        }}
                    ></Cursor>
                </React.Fragment>
            )}
        </React.Fragment>
    );
});

Resizable.defaultProps = {
    is_resizable: false,
    scale: 1,
    style: {},
    bound: DEFAULT_BOUND
};

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
