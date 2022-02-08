import { CursorPointer, CursorType, ResizableProps } from '@/interfaces';
import React, { memo } from 'react';
import styles from './styles.module.css';
import Cursor from './cursor';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

    const handleResizeStart = () => {
        if (!props.is_resizable) {
            return;
        }
        props.onResizeStart?.();
    };

    const calcPositionByCursor = ({ x, y, cursor }: CursorPointer) => {
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
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.nw}
                        x={props.x}
                        y={props.y}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w,
                            max_y: props.y + props.h
                        }}
                    ></Cursor>
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.ne}
                        x={props.x + props.w}
                        y={props.y}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            min_x: props.x,
                            max_y: props.y + props.h
                        }}
                    ></Cursor>
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.sw}
                        x={props.x}
                        y={props.y + props.h}
                        onDragStart={handleResizeStart}
                        onDrag={handleResize}
                        onDragStop={handleResizeStop}
                        bound={{
                            max_x: props.x + props.w,
                            min_y: props.y
                        }}
                    ></Cursor>
                    <Cursor
                        scale={props.scale}
                        cursor={CursorType.se}
                        x={props.x + props.w}
                        y={props.y + props.h}
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

export default memo(Resizable);
