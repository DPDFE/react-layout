import React, { FC } from 'react';
import { useLayoutContext, LayoutContextStore } from './hooks';
import { ReactLayoutContextProps } from '@/interfaces';

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

export default ReactLayoutContext;
