import { ItemPos, LayoutItemProps, LayoutType } from '@/interfaces';
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
    const child = React.Children.only(props.children);
    const item_ref = useRef<HTMLDivElement>(null);

    const { x, y, h, w, i, is_resizable, is_draggable, is_float } =
        props['data-drag'];

    const [pos, setPos] = useState<ItemPos>({ x, y, h, w });

    const default_bound = {
        max_x: undefined,
        min_x: undefined,
        min_y: undefined,
        max_y: undefined
    };

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
            const keydown_pos = handleKeyDown(e);
            if (keydown_pos) {
                setPos(keydown_pos);
                props.onPositionChange?.(keydown_pos);
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
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            width: pos.w,
            height: pos.h,
            ...child.props.style
        }
    });

    return (
        <React.Fragment>
            {props.checked_index === i && props.shadow_pos && (
                <div
                    className={`placeholder ${styles.placeholder}`}
                    style={{
                        transform: `translate(${props.shadow_pos.x}px, ${props.shadow_pos.y}px)`,
                        width: pos.w,
                        height: pos.h
                    }}
                ></div>
            )}
            <Resizable
                {...pos}
                scale={props.scale}
                is_resizable={is_resizable && props.checked_index === i}
                onResizeStart={() => {
                    props.onResizeStart?.();
                }}
                onResize={({ x, y, h, w }) => {
                    setPos({ x, y, w, h });
                    props.onResize?.({ x, y, w, h });
                }}
                bound={
                    props.layout_type === LayoutType.DRAG && is_float
                        ? default_bound
                        : props.bound
                }
                onResizeStop={({ x, y, h, w }) => {
                    setPos({ x, y, h, w });
                    props.onResizeStop?.({ x, y, h, w });
                }}
            >
                <Draggable
                    {...pos}
                    scale={props.scale}
                    is_draggable={is_draggable}
                    onDragStart={() => {
                        props.onDragStart?.();
                    }}
                    bound={
                        props.layout_type === LayoutType.DRAG && is_float
                            ? undefined
                            : {
                                  max_x: props.bound.max_x - w,
                                  min_x: props.bound.min_x,
                                  min_y: props.bound.min_y,
                                  max_y: props.bound.max_y - h
                              }
                    }
                    onDrag={({ x, y }) => {
                        setPos({ x, y, w: pos.w, h: pos.h });
                        props.onDrag?.({ x, y, w: pos.w, h: pos.h });
                    }}
                    onDragStop={({ x, y }) => {
                        setPos({ x, y, w: pos.w, h: pos.h });
                        props.onDragStop?.({ x, y, w: pos.w, h: pos.h });
                    }}
                >
                    {new_child}
                </Draggable>
            </Resizable>
        </React.Fragment>
    );
};

LayoutItem.defaultProps = {
    scale: 1,
    style: {}
};

export default memo(LayoutItem);
