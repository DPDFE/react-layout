import { ResizableProps } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { memo, useEffect, useState } from 'react';

const Resizable = (props: ResizableProps) => {
    const child = React.Children.only(props.children);

    // /** 不选中当前节点 */
    // const unchecked = (e: MouseEvent) => {
    //     if (!(e.target === child.props.children.ref.current)) {
    //         setChecked(false);
    //     }
    // };

    // console.log(props);

    /** 开始 */
    const handleResizeStart = () => {
        if (!props.is_resizable) {
            return;
        }
    };

    const handleResize = () => {};

    const handleResizeStop = () => {};

    // useEffect(() => {
    //     addEvent(window, 'mouseup', unchecked);
    //     return () => {
    //         removeEvent(window, 'mouseup', unchecked);
    //     };
    // }, []);

    const new_child = React.cloneElement(child, {
        // onMouseDown: (e: React.MouseEvent) => {
        //     props.onMouseDown?.(e);
        //     handleResizeStart();
        // },
        style: {
            // border: props.is_resizable
            //     ? '1px dashed #a19e9e'
            //     : '1px solid transparent'
        }
    });

    return new_child;
};

Resizable.defaultProps = {
    scale: 1,
    style: {}
};

export default memo(Resizable);
