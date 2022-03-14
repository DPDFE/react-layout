import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import {
    LayoutEntry,
    LayoutItem,
    LayoutItemEntry,
    OperatorType,
    ReactLayoutContextProps,
    WidgetLocation
} from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';

import useRegistry from './registry/use-registry';

export const useLayoutContext = (props: ReactLayoutContextProps) => {
    const [checked_index, setCurrentChecked] = useState<string>();
    const [drag_item, setDragItem] = useState<LayoutItemEntry>();
    const [operator_type, setOperatorType] = useState<OperatorType>();
    const dragging_layout = useRef<{
        layout: LayoutEntry;
        drag_item: LayoutItemEntry;
    }>();

    const change_store = useRef<{
        type: OperatorType;
        widget_id: string;
        source: WidgetLocation;
        destination?: WidgetLocation;
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
            getDroppingItem
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
            getDroppingItem
        };
    }, [props]);

    const registry = useRegistry();

    useEffect(() => {
        const onMouseMouve = (event: MouseEvent) => {
            event.stopPropagation();
            const layouts = registry.droppable.getAll();
            const { pageX, pageY } = event;
            const cursor_in_layouts = layouts.filter((entry) => {
                const target_element = entry.getRef();
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
                    const pre_dom = prev.getRef()!;
                    const curr_dom = curr.getRef()!;
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

                if (layout && drag_item) {
                    const layout_dom = layout.getRef()!;
                    const drag_item_dom = drag_item.getRef()!;
                    let destination_layout: LayoutItem[] | undefined;

                    // 排除拖拽元素拖进自己内部Layout情况
                    if (
                        drag_item_dom.compareDocumentPosition(layout_dom) &
                        Node.DOCUMENT_POSITION_CONTAINED_BY
                    )
                        return;

                    if (dragging_layout.current) {
                        destination_layout =
                            layout.handlerShadowByDraggingItem(drag_item);
                        if (
                            dragging_layout.current.layout.descriptor.id !==
                            layout.descriptor.id
                        ) {
                            dragging_layout.current.layout.handlerDraggingItemOut(
                                drag_item
                            );
                        }
                        dragging_layout.current = {
                            layout: layout,
                            drag_item: drag_item
                        };
                    } else {
                        dragging_layout.current = {
                            layout: layout,
                            drag_item: drag_item
                        };
                    }

                    if (change_store.current) {
                        change_store.current.destination = destination_layout
                            ? {
                                  layout_id: layout.descriptor.id,
                                  widgets: destination_layout
                              }
                            : undefined;
                        getResponders().onDrag?.(change_store.current);
                    }
                }
            }
        };

        operator_type === OperatorType.drag &&
            drag_item &&
            addEvent(window, 'mousemove', onMouseMouve);

        return () => {
            removeEvent(window, 'mousemove', onMouseMouve);
        };
    }, [drag_item, operator_type]);

    useEffect(() => {
        if (checked_index && operator_type && change_store.current) {
            change_store.current.type = operator_type;
            switch (operator_type) {
                case OperatorType.drag:
                    const dragging_item =
                        registry.draggable.getById(checked_index);
                    setDragItem(dragging_item);
                    break;
                case OperatorType.dragover:
                    if (dragging_layout.current) {
                        const { layout, drag_item } = dragging_layout.current;
                        if (
                            layout.descriptor.id !==
                            drag_item.descriptor.layout_id
                        ) {
                            const pre_layout = registry.droppable.getById(
                                drag_item.descriptor.layout_id
                            );
                            pre_layout?.handlerRemoveWidget(drag_item);
                            layout.handlerAddWidget(drag_item);
                        }
                    }
                    getResponders().onDragStop?.(change_store.current!);
                    setDragItem(undefined);
                    dragging_layout.current = undefined;
                    change_store.current = undefined;
                    break;
            }
        }
    }, [operator_type, registry, checked_index]);

    return useMemo(() => {
        return {
            checked_index,
            setCurrentChecked,
            drag_item,
            setDragItem,
            operator_type,
            setOperatorType,
            dragging_layout,
            registry,
            getResponders,
            change_store
        };
    }, [
        checked_index,
        setCurrentChecked,
        drag_item,
        setDragItem,
        operator_type,
        setOperatorType,
        dragging_layout,
        registry,
        getResponders,
        change_store
    ]);
};

export type LayoutContextStore = ReturnType<typeof useLayoutContext>;
