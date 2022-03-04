import { LayoutItem, OperatorType } from '@/interfaces';
import React, { useState } from 'react';
interface LayoutContext {
    checked_index?: string;
    operator_type?: OperatorType;
    setCurrentChecked: (i?: string) => void;
    setOperatorType: (type?: OperatorType) => void;
    layout_mapping: Record<string, LayoutItem[]>;
}

export const LayoutContext = React.createContext<LayoutContext>({
    checked_index: undefined,
    operator_type: undefined,
    setCurrentChecked: () => {},
    setOperatorType: () => {},
    layout_mapping: {}
});

const ReactLayoutContext = (props: any) => {
    const [checked_index, setCurrentChecked] = useState<string>();
    const [operator_type, setOperatorType] = useState<OperatorType>();
    const [layout_mapping, setLayoutMapping] = useState<
        Record<string, LayoutItem[]>
    >({});

    const value = React.useMemo(
        () => ({
            checked_index,
            setCurrentChecked,
            operator_type,
            setOperatorType,
            layout_mapping,
            setLayoutMapping
        }),
        [
            checked_index,
            setCurrentChecked,
            operator_type,
            setOperatorType,
            layout_mapping,
            setLayoutMapping
        ]
    );

    return (
        <LayoutContext.Provider
            value={value}
            children={props.children}
        ></LayoutContext.Provider>
    );
};

export default ReactLayoutContext;
