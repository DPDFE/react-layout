import { CursorPointer, CursorType, ResizableProps } from '@/interfaces';
import React, { memo } from 'react';
import styles from './styles.module.css';
import Cursor from './cursor';
import { calcBoundPositions, MIN_DRAG_LENGTH } from './calc';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

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
                        w: props.x - x + props.w,
                        h: props.y - y + props.h
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
                        h: props.y - y + props.h
                    },
                    props.bound
                );
                return pos;
            case CursorType.sw:
                pos = calcBoundPositions(
                    {
                        x: x,
                        y: props.y,
                        w: props.x - x + props.w,
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
        className: [
            `react-resizable`,
            props.is_resizable
                ? styles['light-theme-border']
                : styles['no-border']
        ].join(' '),
        style: {
            transform: `translate(${props.x}px, ${props.y}px)`,
            width: props.w,
            height: props.h
        }
    });

    const grid_x = props.is_float ? MIN_DRAG_LENGTH : props.grid[0];
    const grid_y = props.is_float ? MIN_DRAG_LENGTH : props.grid[1];

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
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w - grid_x,
                            max_y: props.y + props.h - grid_y
                        }}
                    ></Cursor>
                    {/* 右上 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.ne}
                        x={props.x + props.w}
                        y={props.y}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            min_x: props.x + grid_x,
                            max_y: props.y + props.h - grid_y
                        }}
                    ></Cursor>
                    {/* 左下 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.sw}
                        x={props.x}
                        y={props.y + props.h}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w - grid_x,
                            min_y: props.y + grid_y
                        }}
                    ></Cursor>
                    {/* 右下 */}
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.se}
                        x={props.x + props.w}
                        y={props.y + props.h}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            min_x: props.x + grid_x,
                            min_y: props.y + grid_y
                        }}
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

export default memo(Resizable);
