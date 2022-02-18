import { CursorPointer, CursorType, ResizableProps } from '@/interfaces';
import React, { memo } from 'react';
import styles from './styles.module.css';
import Cursor from './cursor';
import { calcBoundPositions } from './calc';
import { DEFAULT_BOUND } from '../layout/calc';

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
                            top: -Infinity,
                            left: -Infinity,
                            bottom: props.x + props.w - props.grid.col_width,
                            right: props.y + props.h - props.grid.row_height
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
                            top: -Infinity,
                            right: Infinity,
                            left: props.x + props.grid.col_width,
                            bottom: props.y + props.h - props.grid.row_height
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
                            left: -Infinity,
                            bottom: Infinity,
                            right: props.x + props.w - props.grid.col_width,
                            top: props.y + props.grid.row_height
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
                            right: Infinity,
                            bottom: Infinity,
                            left: props.x + props.grid.col_width,
                            top: props.y + props.grid.row_height
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
    style: {},
    bound: DEFAULT_BOUND
};

export default memo(Resizable);
