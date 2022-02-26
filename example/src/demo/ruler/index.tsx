import React from 'react';
import { ReactDragLayout, LayoutType } from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const RulerLayout = () => {
    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <ReactDragLayout need_ruler></ReactDragLayout>
            <div style={{ display: 'flex', flex: 1, height: '50%' }}>
                <ReactDragLayout
                    need_ruler
                    layout_type={LayoutType.DRAG}
                ></ReactDragLayout>
                <ReactDragLayout
                    need_ruler
                    width={1280}
                    height={1280}
                    layout_type={LayoutType.DRAG}
                ></ReactDragLayout>
            </div>
        </div>
    );
};

export default RulerLayout;
