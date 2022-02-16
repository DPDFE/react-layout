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
import { copyObject, copyObjectArray, noop } from '@/utils/utils';
import {
    calcBoundPositions,
    dynamicCalcLayout,
    snapToGrid,
    dragToGrid,
    createInitialLayout,
    getDropPos,
    gridToDrag,
    sortGridLayoutItems,
    dynamicCalcShadowPos,
    findItemPos,
    moveElement
} from './calc';
import isEqual from 'lodash.isequal';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const canvas_ref = useRef<HTMLDivElement>(null);
    const shadow_ref = useRef<HTMLDivElement>(null);

    const [checked_index, setCurrentChecked] = useState<string>();

    const [shadow_widget, setShadowWidget] = useState<ItemPos | undefined>(
        undefined
    );
    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置
    const [old_layout, setOldLayout] = useState<LayoutItem[]>([]); // 拖拽、排序前的旧定位

    useEffect(() => {
        if (props.children.length > 0) {
            const layout = createInitialLayout(props.children, props.grid);
            const new_layout = dynamicCalcLayout(layout);
            setLayout(new_layout);
            setOldLayout(copyObjectArray(new_layout));
        }
    }, [props.children, props.grid]);

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

    const onDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();

        // 如果是canvas内的子节点会被触发leave
        if (!canvas_ref.current!.contains(e.relatedTarget as Node)) {
            console.log('dragleave');
            setShadowWidget(undefined);
        }
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        e.preventDefault();

        const drop_item = getDropPos(e, props);
        const copy_layout = copyObjectArray(old_layout);

        findItemPos(copy_layout, drop_item);
        moveElement(copy_layout, drop_item);

        const grid_item = dragToGrid(drop_item, props.grid);
        const item = (props as EditLayoutProps).onDrop?.(grid_item);

        if (item && item.i) {
            setShadowWidget(undefined);
            setCurrentChecked(item.i);
        }
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const drop_item = getDropPos(e, props);
        const copy_layout = copyObjectArray(old_layout);

        findItemPos(copy_layout, drop_item);
        moveElement(copy_layout, drop_item);

        if (!isEqual(drop_item, shadow_widget)) {
            setShadowWidget(drop_item);
            setLayout(copy_layout);
        }
    };

    /** 获取当前状态下的layout */
    const getCurrentLayoutByItem = (item: ItemPos, is_save?: boolean) => {
        const copy_layout = copyObjectArray(old_layout);
        const shadow_pos = copyObject(item);

        if (!shadow_pos.is_float) {
            snapToGrid(shadow_pos, props.grid);
        }

        findItemPos(copy_layout, shadow_pos);
        moveElement(copy_layout, shadow_pos);

        setShadowWidget(shadow_pos);
        const new_layout = copy_layout.map((w) => {
            return w.i === item.i
                ? is_save
                    ? { ...w, ...shadow_pos }
                    : { ...w, ...item }
                : w;
        });

        setLayout(new_layout);
        return new_layout.map((w) => {
            return dragToGrid(w, props.grid);
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
            {React.Children.map(props.children, (child, idx) => {
                const widget = layout[idx];
                if (widget) {
                    return (
                        <WidgetItem
                            layout_type={props.layout_type}
                            key={widget.i}
                            {...widget}
                            {...child.props}
                            grid={props.grid}
                            bound={props.bound}
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
