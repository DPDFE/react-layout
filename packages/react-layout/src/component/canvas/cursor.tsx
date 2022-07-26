import { CursorProps } from '@/interfaces';
import React, { memo, useRef } from 'react';
import Draggable, { DEFAULT_BOUND } from './draggable';
import styles from './styles.module.css';

const Cursor = (props: CursorProps) => {
    const cursor_ref = useRef<HTMLDivElement>(null);

    const CURSOR_TRIGGER_TARGET = 20 * (props.scale ?? 1);

    return (
        <Draggable
            x={props.x}
            y={props.y}
            scale={props.scale}
            is_draggable={true}
            use_css_transform={props.use_css_transform}
            onDragStart={({ e, x, y }) => {
                props.onDragStart?.({ e, x, y, cursor: props.cursor });
            }}
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
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: props.cursor,
                    width: CURSOR_TRIGGER_TARGET,
                    height: CURSOR_TRIGGER_TARGET,
                    marginTop: -CURSOR_TRIGGER_TARGET / 2,
                    marginLeft: -CURSOR_TRIGGER_TARGET / 2,
                    ...props.style
                }}
            >
                <div
                    className={styles['resize-handler']}
                    style={{
                        backgroundColor: '#128ee9'
                    }}
                ></div>
            </div>
        </Draggable>
    );
};

Cursor.defaultProps = {
    bound: DEFAULT_BOUND
};

export default memo(Cursor);
