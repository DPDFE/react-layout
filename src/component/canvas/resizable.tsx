import { ResizableProps } from '@/interfaces';
import React from 'react';

const Resizable = (props: ResizableProps) => {
    return <div>{props.children}</div>;
};

export default Resizable;
