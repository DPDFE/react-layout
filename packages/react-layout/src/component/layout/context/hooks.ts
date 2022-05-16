import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    LayoutEntry,
    LayoutItemEntry,
    OperatorType,
    ReactLayoutContextProps
} from '@/interfaces';

import useRegistry from './registry/use-registry';
import Droppable from './droppable';

export const useLayoutContext = (props: ReactLayoutContextProps) => {
    const start_droppable = useRef<Droppable>(); // 开始拖拽的布局
    const moving_droppable = useRef<Droppable>(); // 拖拽中覆盖的布局
    const operator_type = useRef<OperatorType>();

    const [checked_index, setCurrentChecked] = useState<string>();
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

    return useMemo(() => {
        return {
            checked_index,
            setCurrentChecked,
            operator_type,
            dragging_layout,
            registry,
            getResponders,
            dragging_layout_id,
            start_droppable,
            moving_droppable
        };
    }, [
        checked_index,
        setCurrentChecked,
        operator_type,
        dragging_layout,
        registry,
        getResponders,
        dragging_layout_id,
        start_droppable,
        moving_droppable
    ]);
};

export type LayoutContextStore = ReturnType<typeof useLayoutContext>;
