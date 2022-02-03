import { LayoutItemProps } from '@/interfaces';
import React, { memo, useRef, useState } from 'react';
import Draggable from './draggable';
import Resizable from './resizable';
import styles from './styles.module.css';

/**
 * LayoutItem、resizable、draggable（props、child）流转：
 * LayoutItem:
 * child: 调用方child
 * props: Canvas props
 *
 * draggable:
 * child: LayoutItem
 * props: resizable props
 *
 * resizable:
 * child: draggable
 * props: LayoutItem props
 */
const LayoutItem = (props: LayoutItemProps) => {
    const item_ref = useRef<HTMLDivElement>(null);

    const child = React.Children.only(props.children);

    const { x, y, i, is_resizable, is_draggable } = props['data-drag'];

    const [xy, setXY] = useState<{ x: number; y: number }>({ x: x, y: y });
    const [h, setH] = useState<number>(props['data-drag'].h);
    const [w, setW] = useState<number>(props['data-drag'].w);

    const new_child = React.cloneElement(child, {
        onMouseDown: () => {
            props.setCurrentChecked(i);
        },
        ref: item_ref,
        id: `${
            child.props.id
                ? child.props.id + ' layout-item-' + i
                : 'layout-item-' + i
        }`,
        className: `${[child.props.className, styles.layout_item].join(' ')}`,
        style: {
            transform: `translate(${xy.x * props.scale}px, ${
                xy.y * props.scale
            }px)`,
            width: w * props.scale,
            height: h * props.scale,
            ...child.props.style
        }
    });

    return (
        <Resizable
            {...xy}
            h={h}
            w={w}
            is_resizable={is_resizable && props.checked_index === i}
            scale={props.scale}
            onResizeStart={() => {
                props.onResizeStart?.();
            }}
            onResize={({
                x,
                y,
                h,
                w
            }: {
                x: number;
                y: number;
                h: number;
                w: number;
            }) => {
                setXY({ x, y });
                setW(w);
                setH(h);
                const item = Object.assign(props['data-drag'], { x, y, w, h });
                props.onResize?.(item);
            }}
            onResizeStop={({
                x,
                y,
                h,
                w
            }: {
                x: number;
                y: number;
                h: number;
                w: number;
            }) => {
                setXY({ x, y });
                setW(w);
                setH(h);
                const item = Object.assign(props['data-drag'], { x, y, w, h });
                props.onResizeStop?.(item);
            }}
        >
            <Draggable
                {...xy}
                scale={props.scale}
                is_draggable={is_draggable}
                onDragStart={() => {
                    props.onDragStart?.();
                }}
                onDrag={({ x, y }: { x: number; y: number }) => {
                    setXY({ x, y });
                    const item = Object.assign(props['data-drag'], { x, y });
                    props.onDrag?.(item);
                }}
                onDragStop={({ x, y }: { x: number; y: number }) => {
                    setXY({ x, y });
                    const item = Object.assign(props['data-drag'], { x, y });
                    props.onDragStop?.(item);
                }}
            >
                {new_child}
            </Draggable>
        </Resizable>
    );
};

LayoutItem.defaultProps = {
    scale: 1,
    style: {}
};

export default memo(LayoutItem);
