import {
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
    dynamicProgramming,
    dragToGrid,
    createInitialLayout,
    getDropPos,
    compact,
    snapToGrid
} from './calc';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const canvas_ref = useRef<HTMLDivElement>(null);

    const [checked_index, setCurrentChecked] = useState<string>();

    const [shadow_widget, setShadowWidget] = useState<ItemPos | undefined>(
        undefined
    );
    const [layout, setLayout] = useState<LayoutItem[]>([]); // 真实定位位置

    useEffect(() => {
        if (props.children.length > 0) {
            const layout = createInitialLayout(props.children, props.grid);
            compact(layout, props.grid.row_height);
            setLayout(layout);
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

        // const grid_item = dragToGrid(drop_item, props.grid);
        // const item = (props as EditLayoutProps).onDrop?.(grid_item);

        // if (item && item.i) {
        //     setShadowWidget(undefined);
        //     setCurrentChecked(item.i);
        // }
    };

    const onDragOver = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const drop_item = getDropPos(e, props);
        setShadowWidget(drop_item);
        // compact(layout.concat(drop_item), props.grid.row_height);
    };

    /**
     * @author super-hui
     * @param item 添加节点
     * @param is_save 是否需要保存
     * @returns
     */
    const moveLayoutV1 = (item: ItemPos, is_save?: boolean) => {
        const { layout: dynamic_layout, shadow_pos } = dynamicProgramming(
            item,
            layout,
            props.grid,
            props.item_margin
        );

        setShadowWidget(is_save || item.is_float ? undefined : shadow_pos);

        const new_layout = dynamic_layout.map((widget: LayoutItem) => {
            return widget.i === item.i
                ? Object.assign(
                      {},
                      widget,
                      is_save && !item.is_float ? shadow_pos : item
                  )
                : widget;
        });

        setLayout(new_layout);

        return new_layout.map((w) => {
            return dragToGrid(w, props.grid);
        });
    };

    const getLayoutItem = (item: ItemPos) => {
        return layout.find((l) => {
            return l.i == item.i;
        }) as LayoutItem;
    };

    const moveLayoutV2 = (item: ItemPos, is_save?: boolean) => {
        const current_item = getLayoutItem(item);
        const float_item = Object.assign({}, current_item, item);

        if (!current_item.is_float) {
            snapToGrid(item, props.grid, props.item_margin);
            Object.assign(current_item, item);

            compact(layout, props.grid.row_height);
            setShadowWidget(is_save ? undefined : current_item);
        }

        setLayout(
            layout.map((w) => {
                return w.i === item.i && !is_save ? float_item : w;
            })
        );
        return layout.map((w) => {
            return dragToGrid(w, props.grid);
        });
    };

    const getCurrentLayoutByItem = (item: ItemPos, is_save?: boolean) => {
        // return moveLayoutV1(item, is_save);
        return moveLayoutV2(item, is_save);
    };

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
                paddingTop: props.padding.top,
                paddingLeft: props.padding.left,
                paddingBottom: props.padding.bottom,
                paddingRight: props.padding.right
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
                            padding={props.padding}
                            grid={props.grid}
                            bound={props.bound}
                            children={child}
                            width={props.width}
                            height={props.height}
                            scale={props.scale}
                            margin={props.item_margin}
                            is_resizable={
                                widget.is_resizable &&
                                checked_index === widget.i
                            }
                            setCurrentChecked={setCurrentChecked}
                            onDragStart={() => {
                                checked_index === widget.i
                                    ? (props as EditLayoutProps).onDragStart?.()
                                    : noop;
                            }}
                            onDrag={(item) => {
                                if (checked_index === widget.i) {
                                    const layout = getCurrentLayoutByItem(item);
                                    (props as EditLayoutProps).onDrag?.(layout);
                                }
                            }}
                            onDragStop={(item) => {
                                if (checked_index === widget.i) {
                                    const layout = getCurrentLayoutByItem(
                                        item,
                                        true
                                    );
                                    (props as EditLayoutProps).onDragStop?.(
                                        layout
                                    );
                                }
                            }}
                            onResizeStart={() => {
                                if (checked_index === widget.i) {
                                    (
                                        props as EditLayoutProps
                                    ).onResizeStart?.();
                                }
                            }}
                            onResize={(item) => {
                                if (checked_index === widget.i) {
                                    const layout = getCurrentLayoutByItem(item);
                                    (props as EditLayoutProps).onResize?.(
                                        layout
                                    );
                                }
                            }}
                            onResizeStop={(item) => {
                                if (checked_index === widget.i) {
                                    const layout = getCurrentLayoutByItem(
                                        item,
                                        true
                                    );
                                    (props as EditLayoutProps).onResizeStop?.(
                                        layout
                                    );
                                }
                            }}
                            onPositionChange={(item) => {
                                if (checked_index === widget.i) {
                                    const layout = getCurrentLayoutByItem(
                                        item,
                                        true
                                    );
                                    (
                                        props as EditLayoutProps
                                    ).onPositionChange?.(layout);
                                }
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

Canvas.defaultProps = {
    item_margin: [0, 0],
    padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
};

export default memo(Canvas);
