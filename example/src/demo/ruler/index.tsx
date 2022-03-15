import React from 'react';
import { ReactLayout, LayoutType, ReactLayoutContext } from 'react-layout';
import 'react-layout/dist/index.css';

const RulerLayout = () => {
    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <ReactLayoutContext>
                <ReactLayout need_ruler></ReactLayout>
            </ReactLayoutContext>
            <div style={{ display: 'flex', flex: 1, height: '50%' }}>
                <ReactLayoutContext>
                    <ReactLayout
                        need_ruler
                        layout_type={LayoutType.DRAG}
                    ></ReactLayout>
                </ReactLayoutContext>
                <ReactLayoutContext>
                    <ReactLayout
                        need_ruler
                        width={1280}
                        height={1280}
                        layout_type={LayoutType.DRAG}
                    ></ReactLayout>
                </ReactLayoutContext>
            </div>
        </div>
    );
};

export default RulerLayout;
