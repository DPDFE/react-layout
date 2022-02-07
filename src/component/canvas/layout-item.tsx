import { ItemPos, LayoutItemProps } from '@/interfaces';
import React, { memo, useEffect, useRef, useState } from 'react';
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

    const { x, y, h, w, i, is_resizable, is_draggable } = props['data-drag'];

    const [pos, setPos] = useState<ItemPos>({ x, y, h, w });

    useEffect(() => {
        setPos({ x, y, h, w });
    }, [x, y, h, w]);

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        let _pos;
        const keycode_step = 3;

        switch (e.keyCode) {
            case 37: // ArrowLeft
                _pos = Object.assign({}, pos, {
                    x: pos.x - keycode_step
                });
                return _pos;

            case 38: // ArrowUp
                _pos = Object.assign({}, pos, {
                    y: pos.y - keycode_step
                });
                return _pos;

            case 39: // ArrowRight
                _pos = Object.assign({}, pos, {
                    x: pos.x + keycode_step
                });
                return _pos;

            case 40: // ArrowDown
                _pos = Object.assign({}, pos, {
                    y: pos.y + keycode_step
                });
                return _pos;
        }
        return undefined;
    };

    const new_child = React.cloneElement(child, {
        tabIndex: i,
        onMouseDown: () => {
            props.setCurrentChecked(i);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
            const _pos = handleKeyDown(e);
            if (_pos) {
                setPos(_pos);
                const item = Object.assign(child.props['data-drag'], _pos);
                props.onPositionChange?.(item);
            }
        },
        ref: item_ref,
        id: `${
            child.props.id
                ? child.props.id + ' layout-item-' + i
                : 'layout-item-' + i
        }`,
        className: `${[child.props.className, styles.layout_item].join(' ')}`,
        style: {
            transform: `translate(${pos.x * props.scale}px, ${
                pos.y * props.scale
            }px)`,
            width: pos.w * props.scale,
            height: pos.h * props.scale,
            ...child.props.style
        }
    });

    return (
        <Resizable
            {...pos}
            is_resizable={is_resizable && props.checked_index === i}
            scale={props.scale}
            onResizeStart={() => {
                props.onResizeStart?.();
            }}
            onResize={({ x, y, h, w }: ItemPos) => {
                setPos({ x, y, w, h });
                const item = Object.assign(props['data-drag'], { x, y, w, h });
                props.onResize?.(item);
            }}
            onResizeStop={({ x, y, h, w }: ItemPos) => {
                setPos({ x, y, w, h });
                const item = Object.assign(props['data-drag'], { x, y, w, h });
                props.onResizeStop?.(item);
            }}
        >
            <Draggable
                {...pos}
                scale={props.scale}
                is_draggable={is_draggable}
                onDragStart={() => {
                    props.onDragStart?.();
                }}
                onDrag={({ x, y }: { x: number; y: number }) => {
                    setPos({ x, y, w: pos.w, h: pos.h });
                    const item = Object.assign(props['data-drag'], { x, y });
                    props.onDrag?.(item);
                }}
                onDragStop={({ x, y }: { x: number; y: number }) => {
                    setPos({ x, y, w: pos.w, h: pos.h });
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
