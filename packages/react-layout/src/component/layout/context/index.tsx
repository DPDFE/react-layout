import React, { FC, useEffect } from 'react';
import { useLayoutContext, LayoutContextStore } from './hooks';
import { ReactLayoutContextProps } from '@/interfaces';

export const LayoutContext = React.createContext<LayoutContextStore>(
    {} as LayoutContextStore
);

const ReactLayoutContext: FC<ReactLayoutContextProps> = (props) => {
    const store = useLayoutContext(props);

    // checked_index 变化清楚页面选中状态
    useEffect(() => {
        window.getSelection()?.empty();
    }, [store.checked_index]);

    return (
        <LayoutContext.Provider value={store}>
            {props.children}
        </LayoutContext.Provider>
    );
};

export default ReactLayoutContext;
