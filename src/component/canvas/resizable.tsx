import { CursorType, ResizableProps } from '@/interfaces';
import React from 'react';
import Cursor from './cursor';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

    const handleResizeStart = () => {
        if (!props.is_resizable) {
            return;
        }
        props.onResizeStart?.();
    };

    const calcPositionByCursor = ({
        x,
        y,
        cursor
    }: {
        x: number;
        y: number;
        cursor: CursorType;
    }) => {
        switch (cursor) {
            case CursorType.nw:
                return {
                    x: x,
                    y: y,
                    w: props.x - x + props.w,
                    h: props.y - y + props.h
                };
            case CursorType.ne:
                return {
                    x: props.x,
                    y: y,
                    w: x - props.x,
                    h: props.y - y + props.h
                };
            case CursorType.sw:
                return {
                    x: x,
                    y: props.y,
                    w: props.x - x + props.w,
                    h: y - props.y
                };
            case CursorType.se:
                return {
                    x: props.x,
                    y: props.y,
                    w: x - props.x,
                    h: y - props.y
                };
        }
    };

    const handleResize = ({
        x,
        y,
        cursor
    }: {
        x: number;
        y: number;
        cursor: CursorType;
    }) => {
        props.onResize?.(calcPositionByCursor({ x, y, cursor }));
    };

    const handleResizeStop = ({
        x,
        y,
        cursor
    }: {
        x: number;
        y: number;
        cursor: CursorType;
    }) => {
        props.onResizeStop?.(calcPositionByCursor({ x, y, cursor }));
    };

    const new_child = React.cloneElement(child, {
        className: `react-resizable`,
        style: {
            border: props.is_resizable
                ? '1px dashed #a19e9e'
                : '1px solid transparent',
            transform: `translate(${props.x * props.scale}px, ${
                props.y * props.scale
            }px)`,
            width: props.w,
            height: props.h
        }
    });

    return (
        <React.Fragment>
            {new_child}
            {props.is_resizable && (
                <React.Fragment>
                    <Cursor
                        cursor={CursorType.nw}
                        x={props.x}
                        y={props.y}
                        scale={props.scale}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w,
                            max_y: props.y + props.h
                        }}
                    ></Cursor>
                    <Cursor
                        cursor={CursorType.ne}
                        x={props.x + props.w}
                        y={props.y}
                        scale={props.scale}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            min_x: props.x,
                            max_y: props.y + props.h
                        }}
                    ></Cursor>
                    <Cursor
                        cursor={CursorType.sw}
                        x={props.x}
                        y={props.y + props.h}
                        scale={props.scale}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w,
                            min_y: props.y
                        }}
                    ></Cursor>
                    <Cursor
                        cursor={CursorType.se}
                        x={props.x + props.w}
                        y={props.y + props.h}
                        scale={props.scale}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{ min_x: props.x, min_y: props.y }}
                    ></Cursor>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

Resizable.defaultProps = {
    is_resizable: false,
    scale: 1,
    style: {}
};

export default Resizable;
