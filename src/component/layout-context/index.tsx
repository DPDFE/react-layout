import React, {
    useLayoutEffect,
    useRef,
    FunctionComponent,
    memo,
    Fragment
} from 'react';
import { useLayoutContext, LayoutContextStore } from './hooks';
import { ReactLayoutContextProps } from '@/interfaces';

export const LayoutContext = React.createContext<LayoutContextStore>({
    checked_index: undefined,
    operator_type: undefined,
    setCurrentChecked: () => {},
    setOperatorType: () => {}
} as unknown as LayoutContextStore);

const ReactLayoutContext: FunctionComponent<ReactLayoutContextProps> = (
    props
) => {
    const store = useLayoutContext(props);

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
