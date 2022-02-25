import React, { useState } from 'react';
interface LayoutContext {
    checked_index?: string;
    setCurrentChecked: (i?: string) => void;
}

export const LayoutContext = React.createContext<LayoutContext>({
    checked_index: undefined,
    setCurrentChecked: () => {}
});

const ReactLayoutContext = (props: any) => {
    const [checked_index, setCurrentChecked] = useState<string>();
    const value = { checked_index, setCurrentChecked };
    return (
        <LayoutContext.Provider value={value}>
            {props.children}
        </LayoutContext.Provider>
    );
};

export default ReactLayoutContext;
