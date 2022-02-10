import {
    BoundType,
    CanvasProps,
    DragItem,
    EditLayoutProps,
    GridLayoutProps,
    ItemPos,
    LayoutType
} from '@/interfaces';
import React, { memo, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import LayoutItem from './layout-item';
import { addEvent, removeEvent } from '@pearone/event-utils';
import { copyObjectArray, diffObject } from '@/utils/utils';
import { calcBoundPositions, calcBoundRange, snapToGrid } from './calc';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const canvas_ref = useRef<HTMLDivElement>(null);

    const [checked_index, setCurrentChecked] = useState<string>();
    const [operator_stack_pointer, setOperatorStackPointer] =
        useState<number>(-1);

    const [operator_stack, setOperatorStack] = useState<DragItem[][]>([]);
    const [grid, setGrid] = useState<[number, number] | undefined>(undefined);

    const [shadow_widgets, setShadowWidgets] = useState<
        Map<string, ItemPos & { is_float?: boolean }>
    >(new Map());

    const [grid_bound, setGridBound] = useState<BoundType | undefined>(
        undefined
    );

    useEffect(() => {
        const grid =
            (props as GridLayoutProps).cols &&
            props.width &&
            (props as GridLayoutProps).row_height
                ? ([
                      props.width / (props as GridLayoutProps).cols,
                      (props as GridLayoutProps).row_height
                  ] as [number, number])
                : undefined;

        setGrid(grid);
    }, [
        (props as GridLayoutProps).cols,
        props.width,
        (props as GridLayoutProps).row_height
    ]);

    useEffect(() => {
        if (props.width && props.height) {
            const grid_bound = calcBoundRange(props);
            setGridBound(grid_bound);
        }
    }, [
        (props as GridLayoutProps).container_margin,
        props.width,
        props.height
    ]);

    /** 清空选中 */
    const clearChecked = (e: MouseEvent) => {
        if (
            e.target === canvas_ref.current ||
            e.target === props.canvas_wrapper.current
        ) {
            setCurrentChecked(undefined);
        }
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        const current = e.target as HTMLElement;

        const { left, top } = current?.getBoundingClientRect();
        const _x = (e.clientX + current.scrollLeft - left) / props.scale;
        const _y = (e.clientY + current.scrollTop - top) / props.scale;
        const item = (props as EditLayoutProps).onDrop?.({ x: _x, y: _y });
        if (item && item.i) {
            setCurrentChecked(item.i);
            const layout = getCurrentLayoutByItem(item.i, item);
            pushPosStep(layout);
        }
    };

    useEffect(() => {
        // React合成事件和原生事件
        addEvent(document, 'mouseup', clearChecked, { capture: false });
        return () => {
            removeEvent(document, 'mouseup', clearChecked, { capture: false });
        };
    }, []);

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        console.log('onkeydown', operator_stack_pointer, operator_stack);
        /** 撤销还原 */
        const positionChange = (idx: number) => {
            setCurrentChecked(undefined);

            const copy_layout = copyObjectArray(operator_stack[idx]);
            (props as EditLayoutProps).onPositionChange?.(copy_layout);

            setOperatorStackPointer(idx);

            props.setFreshCount(props.fresh_count + 1);
        };

        if (e.keyCode === 90) {
            if (e.shiftKey) {
                // ctrl+shift+Z
                if (operator_stack_pointer === operator_stack.length - 1) {
                    return;
                }
                positionChange(operator_stack_pointer + 1);
            } else {
                // ctrl+Z
                if (operator_stack_pointer === 0) {
                    return;
                }
                positionChange(operator_stack_pointer - 1);
            }
        }
    };

    const pushPosStep = (layout: DragItem[], force: boolean = false) => {
        if (
            diffObject(layout, operator_stack[operator_stack_pointer]) ||
            force
        ) {
            const index = operator_stack_pointer + 1;
            const copy_layout = operator_stack
                .slice(0, index)
                .concat([copyObjectArray(layout)]);

            setOperatorStack(copy_layout);
            setOperatorStackPointer(index);
            props.setFreshCount(props.fresh_count + 1);
        }
    };

    /** 获取当前状态下的layout */
    const getCurrentLayoutByItem = (
        item_idx?: string,
        item?: ItemPos,
        is_save?: boolean
    ) => {
        const widgets_mapping = new Map();

        const layout = props.children.map((child) => {
            const { i, x, y, w, h, is_float } = child.props['data-drag'];

            const getXY = (x: number, y: number) => {
                const shadow_pos = snapToGrid({ x, y }, grid);
                const bound_pos = calcBoundPositions(shadow_pos, grid_bound);
                const widget = {
                    ...bound_pos,
                    w,
                    h,
                    is_float
                };
                widgets_mapping.set(i, widget);
                return bound_pos;
            };

            if (i === item_idx) {
                const final_pos = getXY(item!.x, item!.y);
                return Object.assign(
                    child.props['data-drag'],
                    item,
                    is_save ? final_pos : {}
                );
            } else {
                getXY(x, y);
                return child.props['data-drag'];
            }
        });
        setShadowWidgets(widgets_mapping);
        return layout;
    };

    useEffect(() => {
        if (props.children.length > 0) {
            const init_layout = getCurrentLayoutByItem();
            pushPosStep(init_layout, true);
        }
    }, [props.children.length]);

    return (
        <div
            ref={canvas_ref}
            className={styles.canvas}
            style={{
                width: props.width,
                height: props.height,
                top: props.t_offset,
                left: props.l_offset,
                transform: `scale(${props.scale})`,
                transformOrigin: '0 0',
                overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden'
            }}
            onContextMenu={(e) => {
                e.preventDefault();
            }}
            /** 阻止了onDragOver以后，onDrop事件才生效 */
            onDrop={onDrop}
            onDragOver={(e) => {
                e.preventDefault();
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
                handleKeyDown(e);
            }}
        >
            {props.children.map((child) => {
                return (
                    <LayoutItem
                        layout_type={props.layout_type}
                        key={child.props['data-drag'].i}
                        {...child.props}
                        shadow_pos={shadow_widgets.get(
                            child.props['data-drag'].i
                        )}
                        children={child}
                        bound={grid_bound}
                        width={props.width}
                        height={props.height}
                        scale={props.scale}
                        checked_index={checked_index}
                        setCurrentChecked={setCurrentChecked}
                        onDragStart={() => {
                            (props as EditLayoutProps).onDragStart?.();
                        }}
                        onDrag={(item) => {
                            const layout = getCurrentLayoutByItem(
                                child.props['data-drag'].i,
                                item
                            );
                            (props as EditLayoutProps).onDrag?.(layout);
                        }}
                        onDragStop={(item) => {
                            const layout = getCurrentLayoutByItem(
                                child.props['data-drag'].i,
                                item,
                                true
                            );
                            pushPosStep(layout);
                            (props as EditLayoutProps).onDragStop?.(layout);
                        }}
                        onResizeStart={() => {
                            (props as EditLayoutProps).onResizeStart?.();
                        }}
                        onResize={(item) => {
                            const layout = getCurrentLayoutByItem(
                                child.props['data-drag'].i,
                                item
                            );
                            (props as EditLayoutProps).onResize?.(layout);
                        }}
                        onResizeStop={(item) => {
                            const layout = getCurrentLayoutByItem(
                                child.props['data-drag'].i,
                                item,
                                true
                            );
                            pushPosStep(layout);
                            (props as EditLayoutProps).onResizeStop?.(layout);
                        }}
                        onPositionChange={(item) => {
                            const layout = getCurrentLayoutByItem(
                                child.props['data-drag'].i,
                                item,
                                true
                            );
                            pushPosStep(layout);
                            (props as EditLayoutProps).onPositionChange?.(
                                layout
                            );
                        }}
                    ></LayoutItem>
                );
            })}
        </div>
    );
};

export default memo(Canvas);
