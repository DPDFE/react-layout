import React from 'react';
import { useContext } from 'react';
import LayoutCanvas from './index';
import { LayoutContext } from '../layout-context';
import { ReactLayoutProps } from '@/interfaces';

const ReactLayout = (props: ReactLayoutProps) => {
    const {
        checked_index,
        setCurrentChecked,
        operator_type,
        setOperatorType,
        registry,
        dragging_layout,
        getResponders,
        change_store,
        drag_item,
        setDragItem
    } = useContext(LayoutContext);

    return (
        <LayoutCanvas
            {...props}
            drag_item={drag_item}
            setDragItem={setDragItem}
            checked_index={checked_index}
            setCurrentChecked={setCurrentChecked}
            operator_type={operator_type}
            setOperatorType={setOperatorType}
            registry={registry}
            dragging_layout={dragging_layout}
            getResponders={getResponders}
            change_store={change_store}
        ></LayoutCanvas>
    );
};

export default ReactLayout;
