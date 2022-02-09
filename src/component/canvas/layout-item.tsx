import { ItemPos, LayoutItemProps } from '@/interfaces';
import React, { memo, useEffect, useRef, useState } from 'react';
import { calcBoundBorder, calcBoundStatus } from './calc';
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
    const [calc_pos, setCalcPosition] = useState<{
        x: number;
        y: number;
    }>(pos); // 计算位置

    const [bound_border, setBoundBorder] = useState<
        [number, number, number, number]
    >([0, 0, 0, 0]);

    useEffect(() => {
        const bound_border = calcBoundBorder(props.bound);
        setBoundBorder(bound_border);
    }, [props.bound]);

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
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            width: pos.w,
            height: pos.h,
            ...child.props.style
        }
    });

    return (
        <React.Fragment>
            {props.checked_index && !is_float && (
                <div
                    className={`placeholder ${styles.placeholder}`}
                    style={{
                        transform: `translate(${calc_pos.x}px, ${calc_pos.y}px)`,
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
                onResize={({ x, y, h, w }: ItemPos) => {
                    const data = { x, y, w, h };
                    setPos(data);
                    const item = Object.assign(props['data-drag'], data);
                    props.onResize?.(item);
                }}
                onResizeStop={({ x, y, h, w }: ItemPos) => {
                    const data = { x: calc_pos.x, y: calc_pos.y, w, h };
                    setPos(data);
                    const item = Object.assign(props['data-drag'], data);
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
                        const data = { x, y, w: pos.w, h: pos.h };
                        setPos(data);
                        const item = Object.assign(props['data-drag'], data);
                        props.onDrag?.(item);
                    }}
                    onDragCalcPosition={({
                        x,
                        y
                    }: {
                        x: number;
                        y: number;
                    }) => {
                        setCalcPosition({ x, y });
                    }}
                    onDragStop={({ x, y }: { x: number; y: number }) => {
                        const data = {
                            x: calc_pos.x,
                            y: calc_pos.y,
                            w: pos.w,
                            h: pos.h
                        };
                        setPos(data);
                        const item = Object.assign(props['data-drag'], data);
                        props.onDragStop?.(item);
                    }}
                    grid={props.grid}
                    bound={calcBoundStatus(props, bound_border, w, h, is_float)}
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
