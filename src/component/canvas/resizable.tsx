import { ResizableProps } from '@/interfaces';
import React, { useState } from 'react';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

    const new_child = React.cloneElement(child, {
        // onMouseDown: () => {
        //     console.log('resizable');
        //     setSelected(true);
        // },
        // onMouseUp: () => {
        //     setSelected(false);
        // },
        style: {
            ...props.style,
            ...child.props.style
            // border: selected ? '1px dashed #a19e9e' : '1px solid transparent',
            // zIndex: selected ? 100 : 'inherit'
        }
    });

    return props.is_resizable ? new_child : child;
};

export default Resizable;
