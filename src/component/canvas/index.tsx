import { CanvasProps, DragItem, ItemPos, LayoutType } from '@/interfaces';
import React, { memo, useEffect, useState } from 'react';
import styles from './styles.module.css';
import LayoutItem from './layout-item';
import { addEvent, removeEvent } from '@pearone/event-utils';

/** 画布 */
const Canvas = (props: CanvasProps) => {
    const [checked_index, setCurrentChecked] = useState<string>();
    const [operator_stack_pointer, setOperatorStackPointer] =
        useState<number>(-1);
    const [operator_stack, setOperatorStack] = useState<ItemPos[]>([]);

    /** 清空选中 */
    const clearChecked = (e: MouseEvent) => {
        setCurrentChecked(undefined);
    };

    /** 拖拽添加 */
    const onDrop = (e: React.MouseEvent) => {
        const current = e.target as HTMLElement;

        const { left, top } = current?.getBoundingClientRect();
        const x = (e.clientX + current.scrollLeft - left) / props.scale;
        const y = (e.clientY + current.scrollTop - top) / props.scale;

        setCurrentChecked(props.onDrop?.({ x, y }));

        props.setFreshCount(props.fresh_count + 1);
    };

    /** 获取当前状态下的layout */
    const getCurrentLayoutByItem = (item: DragItem) => {
        return props.children.map(
            (child) =>
                [item].find(
                    (_item) => _item.i === child.props['data-drag'].i
                ) || child.props['data-drag']
        );
    };

    useEffect(() => {
        // React合成事件和原生事件
        const dom = document.querySelector('.react-drag-layout');
        addEvent(dom, 'mouseup', clearChecked, { capture: false });
        return () => {
            removeEvent(dom, 'mouseup', clearChecked, { capture: false });
        };
    }, []);

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        let _pos;

        switch (e.keyCode) {
            case 90: // ctrl+Z
                if (operator_stack_pointer === 0) {
                    return;
                }
                _pos = operator_stack[operator_stack_pointer - 1];
                // setPos(_pos);
                setOperatorStackPointer(operator_stack_pointer - 1);

                return _pos;

            case 89: // ctrl+Z+Y
                if (operator_stack_pointer === operator_stack.length - 1) {
                    return;
                }
                _pos = operator_stack[operator_stack_pointer + 1];
                // setPos(_pos);
                setOperatorStackPointer(operator_stack_pointer + 1);

                return _pos;
        }
        return undefined;
    };

    const pushPosStep = (pos: ItemPos) => {
        setOperatorStack(operator_stack.concat([pos]));
        setOperatorStackPointer(operator_stack_pointer + 1);
    };

    const popPosStep = () => {
        setOperatorStack(operator_stack.splice(0, operator_stack_pointer + 1));
    };

    return (
        <div
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
                e.preventDefault();
                const _pos = handleKeyDown(e);
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
                            popPosStep();
                            props.onDragStart?.();
                        }}
                        onDrag={(item) => {
                            props.onDrag?.(getCurrentLayoutByItem(item));
                        }}
                        onDragStop={(item) => {
                            pushPosStep(item);
                            props.onDragStop?.(getCurrentLayoutByItem(item));
                            props.setFreshCount(props.fresh_count + 1);
                        }}
                        onResizeStart={() => {
                            popPosStep();
                            props.onResizeStart?.();
                        }}
                        onResize={(item) => {
                            props.onResize?.(getCurrentLayoutByItem(item));
                        }}
                        onResizeStop={(item) => {
                            pushPosStep(item);
                            props.onResizeStop?.(getCurrentLayoutByItem(item));
                            props.setFreshCount(props.fresh_count + 1);
                        }}
                    ></LayoutItem>
                );
            })}
        </div>
    );
};

export default memo(Canvas);
