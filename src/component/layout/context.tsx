import React, { useState } from 'react';
interface LayoutContext {
    checked_index?: string;
    setCurrentChecked: (i?: string) => void;
}

// const [checked_index, setCurrentChecked] = useState<string>();

export const LayoutContext = React.createContext<LayoutContext>({
    checked_index: undefined,
    setCurrentChecked: () => {}
});

const ReactLayoutContext = (props: any) => {
    const [checked_index, setCurrentChecked] = useState<string>();

    const value = React.useMemo(
        () => ({ checked_index, setCurrentChecked }),
        [checked_index, setCurrentChecked]
    );

    return (
        <LayoutContext.Provider
            value={value}
            children={props.children}
        ></LayoutContext.Provider>
    );
};

export default ReactLayoutContext;
