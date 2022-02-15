import {
    BoundType,
    CanvasProps,
    DragItem,
    EditLayoutProps,
    ItemPos,
    LayoutType
} from '@/interfaces';
import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import LayoutItem from './layout-item';
import ShadowItem from './shadow-item';
import { addEvent, removeEvent } from '@pearone/event-utils';
import { copyObject, copyObjectArray } from '@/utils/utils';
import {
    calcBoundBorder,
    calcBoundPositions,
    calcBoundRange,
    DEFAULT_BOUND,
    dynamicProgramming,
    snapToGrid,
    dragToGrid,
    createInitialLayout,
    getDropPos,
    gridToDrag,
    MAX_STACK_LENGTH
} from './calc';
import isEqual from 'lodash.isequal';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const canvas_ref = useRef<HTMLDivElement>(null);

    const [checked_index, setCurrentChecked] = useState<string>();
    const [operator_stack_pointer, setOperatorStackPointer] =
        useState<number>(-1);

    const [operator_stack, setOperatorStack] = useState<DragItem[][]>([]);
    const [grid, setGrid] = useState<[number, number] | undefined>(undefined);

    const [shadow_widget, setShadowWidget] = useState<ItemPos | undefined>(
        undefined
    );
    const [layout, setLayout] = useState<DragItem[]>([]); // 真实定位位置

    const [item_bound, setItemBound] =
        useState<Partial<BoundType>>(DEFAULT_BOUND);

    useEffect(() => {
        const canvas_bound = calcBoundBorder(props.container_margin);
        const item_bound = calcBoundRange(props, canvas_bound);
        const grid = [
            (props.width - canvas_bound[1] - canvas_bound[3]) / props.cols,
            props.row_height
        ] as [number, number];
        setGrid(grid);
        setItemBound(item_bound);
    }, [
        props.container_margin,
        props.width,
        props.height,
        props.cols,
        props.row_height
    ]);

    useEffect(() => {
        if (props.children.length > 0 && grid) {
            const layout = createInitialLayout(props.children, grid);
            dynamicProgramming(layout);
            setLayout(layout);
            if (operator_stack.length === 0) {
                setOperatorStack([layout]);
                setOperatorStackPointer(operator_stack_pointer + 1);
            }
        }
    }, [props.children, grid]);

    /** 清空选中 */
    const clearChecked = (e: MouseEvent) => {
        if (
            e.target === canvas_ref.current ||
            e.target === props.canvas_wrapper.current
        ) {
            console.log('clearChecked');
            setCurrentChecked(undefined);
        }
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();
        const item = gridToDrag(
            (props as EditLayoutProps).onDrop?.(
                dragToGrid(snapToGrid(getDropPos(e, props, grid!), grid), grid)
            )!,
            grid!
        );

        if (item && item.i) {
            setShadowWidget(undefined);
            setCurrentChecked(item.i);
            setLayout(layout?.concat([item]));
            getCurrentLayoutByItem(item, true);
        }
    };

    const onDragOver = (e: React.MouseEvent) => {
        // 响应式布局有阴影定位，固定宽高无阴影定位

        const shadow_pos = calcBoundPositions(
            props.layout_type === LayoutType.GRID
                ? snapToGrid(getDropPos(e, props, grid!), grid)
                : getDropPos(e, props, grid!),
            item_bound
        );

        if (!isEqual(shadow_pos, shadow_widget)) {
            console.log('change shadow');
            setShadowWidget(shadow_pos);
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

    const pushPosStep = (layout?: DragItem[]) => {
        if (!isEqual(layout, operator_stack[operator_stack_pointer])) {
            const index = operator_stack_pointer + 1;
            const copy_layout = operator_stack
                .slice(0, index)
                .slice(MAX_STACK_LENGTH)
                .concat([copyObjectArray(layout!)]);
            console.log('index', index, copy_layout);

            setOperatorStack(copy_layout);
            setOperatorStackPointer(index);
            props.setFreshCount(props.fresh_count + 1);
        }
    };

    /** 获取当前状态下的layout */
    const getCurrentLayoutByItem = (item: ItemPos, is_save?: boolean) => {
        const shadow_pos = calcBoundPositions(
            snapToGrid(copyObject(item), grid),
            item_bound
        );

        setShadowWidget(is_save || item.is_float ? undefined : shadow_pos);

        const new_layout = layout!.map((widget) => {
            return widget.i === item.i
                ? Object.assign(
                      {},
                      widget,
                      is_save && !item.is_float ? shadow_pos : item
                  )
                : widget;
        });
        dynamicProgramming(new_layout, grid, item_bound);

        setLayout(new_layout);
        is_save && pushPosStep(new_layout);

        return new_layout.map((w) => {
            return { ...w, ...dragToGrid(w, grid) };
        });
    };

    console.log('render canvas');

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
                overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden',
                padding: props.container_margin.map((i) => i + 'px').join(' ')
            }}
            onContextMenu={(e) => {
                e.preventDefault();
            }}
            /** 阻止了onDragOver以后，onDrop事件才生效 */
            onDrop={onDrop}
            onDragOver={(e) => {
                e.preventDefault();
                onDragOver(e);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
                handleKeyDown(e);
            }}
        >
            <ShadowItem {...shadow_widget} />
            {React.Children.map(props.children, (child, idx) => {
                const widget = layout[idx];
                if (widget) {
                    return (
                        <LayoutItem
                            layout_type={props.layout_type}
                            key={widget.i}
                            {...widget}
                            {...child.props}
                            grid={grid}
                            bound={item_bound}
                            children={child}
                            width={props.width}
                            height={props.height}
                            scale={props.scale}
                            is_resizable={
                                widget.is_resizable &&
                                checked_index === widget.i
                            }
                            setCurrentChecked={setCurrentChecked}
                            onDragStart={() => {
                                (props as EditLayoutProps).onDragStart?.();
                            }}
                            onDrag={(item) => {
                                const layout = getCurrentLayoutByItem(item);
                                (props as EditLayoutProps).onDrag?.(layout);
                            }}
                            onDragStop={(item) => {
                                const layout = getCurrentLayoutByItem(
                                    item,
                                    true
                                );
                                (props as EditLayoutProps).onDragStop?.(layout);
                            }}
                            onResizeStart={() => {
                                (props as EditLayoutProps).onResizeStart?.();
                            }}
                            onResize={(item) => {
                                const layout = getCurrentLayoutByItem(item);
                                (props as EditLayoutProps).onResize?.(layout);
                            }}
                            onResizeStop={(item) => {
                                const layout = getCurrentLayoutByItem(
                                    item,
                                    true
                                );
                                (props as EditLayoutProps).onResizeStop?.(
                                    layout
                                );
                            }}
                            onPositionChange={(item) => {
                                const layout = getCurrentLayoutByItem(
                                    item,
                                    true
                                );
                                (props as EditLayoutProps).onPositionChange?.(
                                    layout
                                );
                            }}
                        />
                    );
                } else {
                    return <Fragment></Fragment>;
                }
            })}
        </div>
    );
};

export default memo(Canvas);
