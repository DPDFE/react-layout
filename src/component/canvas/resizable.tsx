import { CursorType, ResizableProps } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { memo } from 'react';
import Cursor from './cursor';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

    console.log(props.is_resizable);

    /** 开始 */
    const handleResizeStart = () => {
        if (!props.is_resizable) {
            return;
        }
    };

    const handleResize = () => {};

    const handleResizeStop = () => {};

    const new_child = React.cloneElement(child, {
        className: `react-resizable`,
        style: {
            border: props.is_resizable
                ? '1px dashed #a19e9e'
                : '1px solid transparent'
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
                    ></Cursor>
                    <Cursor
                        cursor={CursorType.ne}
                        x={props.x + props.w}
                        y={props.y}
                        scale={props.scale}
                    ></Cursor>
                    <Cursor
                        cursor={CursorType.sw}
                        x={props.x}
                        y={props.y + props.h}
                        scale={props.scale}
                    ></Cursor>
                    <Cursor
                        cursor={CursorType.se}
                        x={props.x + props.w}
                        y={props.y + props.h}
                        scale={props.scale}
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
