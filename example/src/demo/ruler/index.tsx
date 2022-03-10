import React from 'react';
import {
    ReactDragLayout,
    LayoutType,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const RulerLayout = () => {
    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <ReactLayoutContext>
                <ReactDragLayout need_ruler></ReactDragLayout>
            </ReactLayoutContext>
            <div style={{ display: 'flex', flex: 1, height: '50%' }}>
                <ReactLayoutContext>
                    <ReactDragLayout
                        need_ruler
                        layout_type={LayoutType.DRAG}
                    ></ReactDragLayout>
                </ReactLayoutContext>
                <ReactLayoutContext>
                    <ReactDragLayout
                        need_ruler
                        width={1280}
                        height={1280}
                        layout_type={LayoutType.DRAG}
                    ></ReactDragLayout>
                </ReactLayoutContext>
            </div>
        </div>
    );
};

export default RulerLayout;
