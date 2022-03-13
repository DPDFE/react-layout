import React, { FC } from 'react';
import { useLayoutContext, LayoutContextStore } from './hooks';
import { ReactLayoutContextProps } from '@/interfaces';

export const LayoutContext = React.createContext<LayoutContextStore>({
    checked_index: undefined,
    operator_type: undefined,
    setCurrentChecked: () => {},
    setOperatorType: () => {}
} as unknown as LayoutContextStore);

const ReactLayoutContext: FC<ReactLayoutContextProps> = (props) => {
    const store = useLayoutContext(props);

    return (
        <LayoutContext.Provider value={store}>
            {props.children}
        </LayoutContext.Provider>
    );
};

export default ReactLayoutContext;
