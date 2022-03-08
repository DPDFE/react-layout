import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { LayoutEntry, LayoutItemDimesion, OperatorType } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';

import useRegistry from './registry/use-registry';

export const useLayoutContext = () => {
    const [checked_index, setCurrentChecked] = useState<string>();
    const [drag_item, setDragItem] = useState<LayoutItemDimesion>();
    const [operator_type, setOperatorType] = useState<OperatorType>();
    const [drag_to_layout, setDragLayout] = useState('');

    const registry = useRegistry();

    // useLayoutEffect(() => {
    //     console.log(checked_index);
    // }, [checked_index]);

    // useLayoutEffect(() => {
    //     console.log(drag_item?.i);
    // }, [drag_item]);

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

            console.log(cursor_in_layouts);
        };

        drag_item && addEvent(window, 'mousemove', onMouseMouve);

        return () => {
            removeEvent(window, 'mousemove', onMouseMouve);
        };
    }, [drag_item?.i]);

    return useMemo(() => {
        return {
            checked_index,
            setCurrentChecked,
            drag_item,
            setDragItem,
            operator_type,
            setOperatorType,
            drag_to_layout,
            setDragLayout,
            registry
        };
    }, [
        checked_index,
        setCurrentChecked,
        drag_item,
        setDragItem,
        operator_type,
        setOperatorType,
        drag_to_layout,
        setDragLayout,
        registry
    ]);
};

export type LayoutContextStore = ReturnType<typeof useLayoutContext>;
