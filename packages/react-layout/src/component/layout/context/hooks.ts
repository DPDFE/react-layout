import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    LayoutEntry,
    LayoutItemEntry,
    OperatorType,
    ReactLayoutContextProps
} from '@/interfaces';
import { addEvent, removeEvent } from '@dpdfe/event-utils';

import useRegistry from './registry/use-registry';

export const useLayoutContext = (props: ReactLayoutContextProps) => {
    const sticky_target_queue = useRef<string[]>([]);
    const [checked_index, setCurrentChecked] = useState<string>();
    const [operator_type, setOperatorType] = useState<OperatorType>();
    const dragging_layout_id = useRef<string>();
    const dragging_layout =
        useRef<{
            layout: LayoutEntry;
            drag_item: LayoutItemEntry;
        }>();

    const getResponders = useCallback(() => {
        const {
            onDragStart,
            onDrag,
            onDragStop,
            onDrop,
            onChange,
            onResizeStart,
            onResize,
            onResizeStop,
            getDroppingItem,
            onPositionChange
        } = props;
        return {
            onDragStart,
            onDrag,
            onDragStop,
            onDrop,
            onResizeStart,
            onResize,
            onResizeStop,
            onChange,
            getDroppingItem,
            onPositionChange
        };
    }, [props]);

    const registry = useRegistry();

    // checked_index 变化清楚页面选中状态
    useEffect(() => {
        window.getSelection()?.empty();
    }, [checked_index]);

    useEffect(() => {
        const onMouseMouve = (event: MouseEvent) => {
            event.stopPropagation();

            const layouts = registry.droppable.getAll();
            const { pageX, pageY } = event;
            const cursor_in_layouts = layouts.filter((entry) => {
                if (!entry.is_droppable) {
                    return false;
                }
                const target_element = entry.getViewPortRef();
                if (target_element) {
                    const { left, top, width, height } =
                        target_element.getBoundingClientRect();
                    const newState = {
                        elementX: NaN,
                        elementY: NaN,
                        elementH: NaN,
                        elementW: NaN,
                        elementPosX: NaN,
                        elementPosY: NaN
                    };
                    newState.elementPosX = left + window.pageXOffset;
                    newState.elementPosY = top + window.pageYOffset;
                    newState.elementX = pageX - newState.elementPosX;
                    newState.elementY = pageY - newState.elementPosY;
                    newState.elementW = width;
                    newState.elementH = height;

                    const { elementW, elementH, elementX, elementY } = newState;

                    const cursor_in_element =
                        elementX > 0 &&
                        elementY > 0 &&
                        elementX < elementW &&
                        elementY < elementH;
                    return cursor_in_element;
                }
                return false;
            });

            if (cursor_in_layouts.length > 0) {
                const layout = cursor_in_layouts.reduce((prev, curr) => {
                    const pre_dom = prev.getViewPortRef()!;
                    const curr_dom = curr.getViewPortRef()!;
                    const postion = pre_dom.compareDocumentPosition(curr_dom);

                    // 判断元素相对位置
                    // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/compareDocumentPosition
                    if (
                        postion & Node.DOCUMENT_POSITION_CONTAINED_BY ||
                        postion & Node.DOCUMENT_POSITION_FOLLOWING
                    )
                        return curr;
                    if (
                        postion & Node.DOCUMENT_POSITION_CONTAINS ||
                        postion & Node.DOCUMENT_POSITION_PRECEDING
                    )
                        return prev;

                    return curr;
                });

                if (layout) {
                    if (
                        dragging_layout.current &&
                        dragging_layout_id.current &&
                        dragging_layout_id.current !== layout.descriptor.id
                    ) {
                        const { layout, drag_item } = dragging_layout.current;
                        layout.handlerDraggingItemOut(drag_item);
                    }
                    dragging_layout_id.current = layout.descriptor.id;
                    return;
                }
            } else if (dragging_layout.current) {
                const { layout, drag_item } = dragging_layout.current;
                layout.handlerDraggingItemOut(drag_item);
            }

            dragging_layout_id.current = undefined;
        };

        operator_type === OperatorType.drag &&
            addEvent(window, 'mousemove', onMouseMouve);

        return () => {
            dragging_layout_id.current = undefined;
            removeEvent(window, 'mousemove', onMouseMouve);
        };
    }, [operator_type, getResponders]);

    return useMemo(() => {
        return {
            sticky_target_queue,
            checked_index,
            setCurrentChecked,
            operator_type,
            setOperatorType,
            dragging_layout,
            registry,
            getResponders,
            dragging_layout_id
        };
    }, [
        sticky_target_queue,
        checked_index,
        setCurrentChecked,
        operator_type,
        setOperatorType,
        dragging_layout,
        registry,
        getResponders,
        dragging_layout_id
    ]);
};

export type LayoutContextStore = ReturnType<typeof useLayoutContext>;
