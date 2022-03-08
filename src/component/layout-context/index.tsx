import React, { useLayoutEffect, useRef } from 'react';
import { useLayoutContext, LayoutContextStore } from './hooks';
import Draggable, { clamp } from '../canvas/draggable';

export const LayoutContext = React.createContext<LayoutContextStore>(
    {} as LayoutContextStore
);

const ReactLayoutContext = (props: any) => {
    const store = useLayoutContext();

    // useLayoutEffect(() => {
    //     if (store.drag_item && store.drag_item.ref?.current) {
    //         const dragging_copy = store.drag_item.ref.current.cloneNode(true);
    //         dragging_ref?.current?.appendChild(dragging_copy);
    //     } else {
    //         dragging_ref?.current?.firstChild?.remove();
    //     }
    // }, [store.drag_item?.i]);

    return (
        <LayoutContext.Provider value={store}>
            {props.children}
        </LayoutContext.Provider>
    );
};

export default ReactLayoutContext;
