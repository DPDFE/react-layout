import React, { FC, useEffect } from 'react';
import { ItemPos, ReactLayoutContextProps } from '@/interfaces';

import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutItem, OperatorType, StickyTarget } from '@/interfaces';

import useRegistry from './registry/use';
import Droppable from './droppable';

export const LayoutContext = React.createContext<LayoutContextStore>(
    {} as LayoutContextStore
);

const ReactLayoutContext: FC<ReactLayoutContextProps> = (props) => {
    const store = useLayoutContext(props);

    return (
        <LayoutContext.Provider value={store}>
            {props.children}
        </LayoutContext.Provider>
    );
};

export const useLayoutContext = (props: ReactLayoutContextProps) => {
    const operator_type = useRef<OperatorType>(); // 操作状态

    const start_droppable = useRef<Droppable>(); // 开始拖拽的布局
    const moving_droppable = useRef<Droppable>(); // 拖拽中覆盖的布局

    const sticky_target_queue = useRef<StickyTarget[]>([]); //当前置顶元素列表

    const drop_enter_counter = useRef<number>(0); // 拖拽状态

    const drag_item = useRef<LayoutItem>(); // 拖拽的元素

    const [checked_index, setCurrentChecked] = useState<string>(); // 选中widget index

    const [placeholder, setPlaceHolder] = useState<ItemPos>(); // 全局的阴影

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
            start_droppable,
            moving_droppable,
            drop_enter_counter,
            drag_item,
            placeholder,
            setPlaceHolder
        };
    }, [
        sticky_target_queue,
        checked_index,
        setCurrentChecked,
        operator_type,
        registry,
        getResponders,
        start_droppable,
        moving_droppable,
        drop_enter_counter,
        drag_item,
        placeholder,
        setPlaceHolder
    ]);
};

export type LayoutContextStore = ReturnType<typeof useLayoutContext>;

export default ReactLayoutContext;
