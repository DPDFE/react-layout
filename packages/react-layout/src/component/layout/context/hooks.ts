import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    LayoutEntry,
    LayoutItemEntry,
    OperatorType,
    ReactLayoutContextProps
} from '@/interfaces';

import useRegistry from './registry/use-registry';

export const useLayoutContext = (props: ReactLayoutContextProps) => {
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

    return useMemo(() => {
        return {
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
