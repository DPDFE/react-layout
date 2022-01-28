import { ResizableProps } from '@/interfaces';
import React from 'react';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

    const new_child = React.cloneElement(child, {
        onMouseDown: () => {
            console.log('resizable');
        },
        style: {
            ...props.style,
            ...child.props.style,
            border: '1px dashed #a19e9e'
        }
    });

    return new_child;
};

export default Resizable;
