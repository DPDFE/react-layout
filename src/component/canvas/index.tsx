import { CanvasProps, LayoutType } from '@/interfaces';
import React, { memo, useEffect, useState } from 'react';
import styles from './styles.module.css';
import LayoutItem from './layout-item';
import { addEvent, removeEvent } from '@pearone/event-utils';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const [checked_index, setCurrentChecked] = useState<string>();

    const clearChecked = (e: MouseEvent) => {
        setCurrentChecked(undefined);
    };

    useEffect(() => {
        // React合成事件和原生事件
        const dom = document.querySelector('.react-drag-layout');
        addEvent(dom, 'mouseup', clearChecked, { capture: false });
        return () => {
            removeEvent(dom, 'mouseup', clearChecked, { capture: false });
        };
    }, []);
    return (
        <div
            className={styles.canvas}
            style={{
                width: props.width * props.scale,
                height: props.height * props.scale,
                top: props.t_offset,
                left: props.l_offset,
                overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden'
            }}
            /** 阻止了onDragOver以后，onDrop事件才生效 */
            onDragOver={(e) => {
                e.preventDefault();
            }}
            onDrop={(e) => {
                const current = e.target as HTMLElement;
                const { left, top } = current?.getBoundingClientRect();
                const x = (e.clientX + current.scrollLeft - left) / props.scale;
                const y = (e.clientY + current.scrollTop - top) / props.scale;
                setCurrentChecked(props.onDrop?.({ x, y }));
            }}
        >
            {props.children.map((child) => {
                return (
                    <LayoutItem
                        key={child.props['data-drag'].i}
                        {...child.props}
                        children={child}
                        scale={props.scale}
                        checked_index={checked_index}
                        setCurrentChecked={setCurrentChecked}
                        onDragStart={() => {
                            props.onDragStart?.();
                        }}
                        onDrag={() => {
                            props.onDrag?.();
                        }}
                        onDragStop={() => {
                            props.onDragStop?.();
                        }}
                        onResizeStart={() => {
                            props.onResizeStart?.();
                        }}
                        onResizeStop={(layout: any) => {
                            props.onResizeStop?.();
                        }}
                    ></LayoutItem>
                );
            })}
        </div>
    );
};

export default memo(Canvas);
