import { DragItemProps } from '@/interfaces';
import React from 'react';

const DragItem = (props: DragItemProps) => {
    // const child = React.Children.only(props.children);
    return <div>{props.children}</div>;
};

export default DragItem;
