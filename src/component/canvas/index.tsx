import {
    BoundType,
    CanvasProps,
    LayoutItem,
    EditLayoutProps,
    ItemPos,
    LayoutType
} from '@/interfaces';
import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import WidgetItem from './layout-item';
import { addEvent, removeEvent } from '@pearone/event-utils';
import { copyObject, noop } from '@/utils/utils';
import {
    calcBoundBorder,
    calcBoundPositions,
    calcBoundRange,
    DEFAULT_BOUND,
    dynamicCalcLayout,
    snapToGrid,
    dragToGrid,
    createInitialLayout,
    getDropPos,
    gridToDrag,
    sortGridLayoutItems,
    dynamicCalcShadowPos
} from './calc';
import isEqual from 'lodash.isequal';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_ref = useRef<HTMLDivElement>(null);

    const [checked_index, setCurrentChecked] = useState<string>();

    const [grid, setGrid] = useState<[number, number] | undefined>(undefined);

    const [shadow_widget, setShadowWidget] = useState<ItemPos | undefined>(
        undefined
    );
    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置

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
            // const { new_layout } = dynamicCalcLayout(layout, grid, item_bound);
            console.log('init');
            setLayout(layout);
        }
    }, [props.children, grid]);

    /** 清空选中 */
    const clearCheckedEvent = (e: MouseEvent) => {
        setShadowWidget(undefined);
        if (
            e.target === canvas_ref.current ||
            e.target === props.canvas_wrapper.current
        ) {
            console.log('clearChecked');
            setCurrentChecked(undefined);
        }
    };

    useEffect(() => {
        // React合成事件和原生事件
        addEvent(document, 'mouseup', clearCheckedEvent, { capture: false });
        return () => {
            removeEvent(document, 'mouseup', clearCheckedEvent, {
                capture: false
            });
        };
    }, []);

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();

        const drop_item = getDropPos(e, props, grid!);
        const grid_layout = sortGridLayoutItems(layout);
        const { shadow_pos } = dynamicCalcShadowPos(
            grid_layout,
            grid!,
            item_bound,
            drop_item
        );

        const grid_item = dragToGrid(shadow_pos, grid);
        const item = (props as EditLayoutProps).onDrop?.(grid_item);

        if (item && item.i) {
            setShadowWidget(undefined);
            setCurrentChecked(item.i);
        }
    };

    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();

        // 如果是canvas内的子节点会被触发leave
        if (!canvas_ref.current!.contains(e.relatedTarget as Node)) {
            console.log('dragleave');
            setShadowWidget(undefined);
        }
    };

    const onDragEnter = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 响应式布局有阴影定位，固定宽高无阴影定位
        const grid_layout = sortGridLayoutItems(layout);
        console.log(grid_layout);

        const drop_item = getDropPos(e, props, grid!);
        const { shadow_pos } = dynamicCalcShadowPos(
            grid_layout,
            grid!,
            item_bound,
            drop_item
        );

        if (!isEqual(shadow_pos, shadow_widget)) {
            setShadowWidget(shadow_pos);
        }
    };

    /** 获取当前状态下的layout */
    const getCurrentLayoutByItem = (item: ItemPos, is_save?: boolean) => {
        const { shadow_pos, new_layout } = dynamicCalcLayout(
            layout,
            grid,
            item_bound,
            copyObject(item)
        );

        setShadowWidget(shadow_pos);

        setLayout(
            new_layout.map((w) => {
                return w.i === item.i ? { ...w, ...shadow_pos } : w;
            })
        );

        return new_layout.map((w) => {
            return { ...w, ...dragToGrid(w, grid) };
        });
    };

    // console.log('render canvas');

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
            onDrop={props.mode === LayoutType.edit ? onDrop : noop}
            onDragLeave={props.mode === LayoutType.edit ? onDragLeave : noop}
            onDragEnter={props.mode === LayoutType.edit ? onDragEnter : noop}
            onDragOver={props.mode === LayoutType.edit ? onDragOver : noop}
        >
            {shadow_widget && (
                <div
                    ref={shadow_ref}
                    className={`placeholder ${styles.placeholder}`}
                    style={{
                        transform: `translate(${shadow_widget.x}px, ${shadow_widget.y}px)`,
                        width: shadow_widget.w,
                        height: shadow_widget.h
                    }}
                ></div>
            )}
            {/* <WidgetItem {...shadow_widget}></WidgetItem> */}
            {React.Children.map(props.children, (child, idx) => {
                const widget = layout[idx];
                if (widget) {
                    return (
                        <WidgetItem
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
