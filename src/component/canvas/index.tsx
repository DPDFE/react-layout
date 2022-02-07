import { CanvasProps, DragItem, LayoutType } from '@/interfaces';
import React, { memo, useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';
import LayoutItem from './layout-item';
import { addEvent, removeEvent } from '@pearone/event-utils';
import { copyObjectArray, diffObject } from '@/utils/utils';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const canvas_ref = useRef<HTMLDivElement>(null);

    const [checked_index, setCurrentChecked] = useState<string>();
    const [operator_stack_pointer, setOperatorStackPointer] =
        useState<number>(-1);
    const [operator_stack, setOperatorStack] = useState<DragItem[][]>([]);

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
        const x = (e.clientX + current.scrollLeft - left) / props.scale;
        const y = (e.clientY + current.scrollTop - top) / props.scale;
        const item = props.onDrop?.({ x, y });
        setCurrentChecked(item?.i);
        pushPosStep(getCurrentLayoutByItem(item));
    };

    /** 获取当前状态下的layout */
    const getCurrentLayoutByItem = (item?: DragItem) => {
        return props.children.map(
            (child) =>
                [item].find(
                    (_item) => _item && _item.i === child.props['data-drag'].i
                ) || child.props['data-drag']
        );
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
            props.onPositionChange?.(copy_layout);

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
                width: props.width * props.scale,
                height: props.height * props.scale,
                top: props.t_offset,
                left: props.l_offset,
                overflow: props.mode === LayoutType.edit ? 'unset' : 'hidden'
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
                        key={child.props['data-drag'].i}
                        {...child.props}
                        children={child}
                        scale={props.scale}
                        checked_index={checked_index}
                        setCurrentChecked={setCurrentChecked}
                        onDragStart={() => {
                            props.onDragStart?.();
                        }}
                        onDrag={(item) => {
                            props.onDrag?.(getCurrentLayoutByItem(item));
                        }}
                        onDragStop={(item) => {
                            const _layout = getCurrentLayoutByItem(item);
                            pushPosStep(_layout);
                            props.onDragStop?.(_layout);
                        }}
                        onResizeStart={() => {
                            props.onResizeStart?.();
                        }}
                        onResize={(item) => {
                            props.onResize?.(getCurrentLayoutByItem(item));
                        }}
                        onResizeStop={(item) => {
                            const _layout = getCurrentLayoutByItem(item);
                            pushPosStep(_layout);
                            props.onResizeStop?.(_layout);
                        }}
                        onPositionChange={(item) => {
                            const _layout = getCurrentLayoutByItem(item);
                            pushPosStep(_layout);
                            props.onPositionChange?.(_layout);
                        }}
                    ></LayoutItem>
                );
            })}
        </div>
    );
};

export default memo(Canvas);
