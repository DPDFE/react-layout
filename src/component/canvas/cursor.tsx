import { CursorProps } from '@/interfaces';
import React, { memo, useRef } from 'react';
import Draggable from './draggable';
import styles from './styles.module.css';

const Cursor = (props: CursorProps) => {
    const cursor_ref = useRef<HTMLDivElement>(null);

    return (
        <Draggable
            x={props.x}
            y={props.y}
            scale={props.scale}
            is_draggable={true}
            onDragStart={props.onDragStart}
            onDrag={({ x, y }) => {
                props.onDrag?.({ x, y, cursor: props.cursor });
            }}
            onDragStop={({ x, y }) => {
                props.onDragStop?.({ x, y, cursor: props.cursor });
            }}
            bound={props.bound}
        >
            <div
                tabIndex={0}
                ref={cursor_ref}
                className={[
                    styles['resize-handler'],
                    styles['light-theme']
                ].join(' ')}
                style={{
                    cursor: props.cursor
                }}
            ></div>
        </Draggable>
    );
};

export default memo(Cursor);
