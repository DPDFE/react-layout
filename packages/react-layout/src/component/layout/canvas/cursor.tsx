import { CursorProps } from '@/interfaces';
import React, { memo, useRef } from 'react';
import Draggable, { DEFAULT_BOUND } from './draggable';
import styles from './styles.module.css';

const Cursor = (props: CursorProps) => {
    const cursor_ref = useRef<HTMLDivElement>(null);

    return (
        <Draggable
            x={props.x}
            y={props.y}
            scale={props.scale}
            is_draggable={true}
            use_css_transform={props.use_css_transform}
            onDragStart={props.onDragStart}
            onDrag={({ e, x, y }) => {
                props.onDrag?.({ e, x, y, cursor: props.cursor });
            }}
            onDragStop={({ e, x, y }) => {
                props.onDragStop?.({ e, x, y, cursor: props.cursor });
            }}
            bound={props.bound}
            onContextMenu={(e) => {
                e.preventDefault();
                return false;
            }}
        >
            <div
                tabIndex={0}
                ref={cursor_ref}
                className={styles['resize-handler']}
                style={{
                    cursor: props.cursor,
                    marginTop: -3,
                    marginLeft: -3,
                    backgroundColor: '#128ee9',
                    ...props.style
                }}
            ></div>
        </Draggable>
    );
};

Cursor.defaultProps = {
    bound: DEFAULT_BOUND
};

export default memo(Cursor);
