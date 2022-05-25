import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    OperatorType,
    ReactLayoutContextProps,
    StickyTarget
} from '@/interfaces';

import useRegistry from './registry/use-registry';
import Droppable from './droppable';

export const useLayoutContext = (props: ReactLayoutContextProps) => {
    const operator_type = useRef<OperatorType>(); // 操作状态

    const start_droppable = useRef<Droppable>(); // 开始拖拽的布局
    const moving_droppable = useRef<Droppable>(); // 拖拽中覆盖的布局

    const sticky_target_queue = useRef<StickyTarget[]>([]); //当前置顶元素列表

    const [checked_index, setCurrentChecked] = useState<string>();
    const dragging_layout_id = useRef<string>();

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
            sticky_target_queue,
            checked_index,
            setCurrentChecked,
            operator_type,
            registry,
            getResponders,
            dragging_layout_id,
            start_droppable,
            moving_droppable
        };
    }, [
        sticky_target_queue,
        checked_index,
        setCurrentChecked,
        operator_type,
        registry,
        getResponders,
        dragging_layout_id,
        start_droppable,
        moving_droppable
    ]);
};

export type LayoutContextStore = ReturnType<typeof useLayoutContext>;
