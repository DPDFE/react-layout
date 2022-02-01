import { CursorType } from '@/interfaces';
import React, { useRef } from 'react';
import Draggable from './draggable';
import styles from './styles.module.css';

interface CursorProps {
    cursor: CursorType;
    x: number;
    y: number;
    scale: number;
}

const Cursor = (props: CursorProps) => {
    const cursor_ref = useRef<HTMLDivElement>(null);
    return (
        <Draggable
            x={props.x}
            y={props.y}
            scale={props.scale}
            is_draggable={true}
        >
            <div
                ref={cursor_ref}
                className={styles['resize-handler']}
                style={{
                    cursor: props.cursor,
                    background: '#ddd'
                }}
            ></div>
        </Draggable>
    );
};

export default Cursor;
