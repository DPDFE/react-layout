import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const ResizableDragResponsiveLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 6 }).map((_, i) => {
            const random = parseInt((Math.random() * 500).toFixed());
            return {
                w: 100,
                h: 100,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: true,
                is_draggable: true,
                is_float: true
            };
        });
    }

    return (
        <ReactLayoutContext>
            <ReactDragLayout
                need_ruler
                layout_type={LayoutType.GRID}
                mode={LayoutType.edit}
                onResizeStart={() => {
                    console.log('onResizeStart');
                }}
                onResize={(layout: LayoutItem[]) => {
                    console.log('onResize');
                }}
                onResizeStop={(layout: LayoutItem[]) => {
                    console.log('onResizeStop');
                    setWidgets(layout);
                }}
            >
                {widgets.map((w) => {
                    return (
                        <div
                            key={w.i}
                            data-drag={w}
                            style={{
                                border: '1px solid',
                                padding: 10
                            }}
                        >
                            我是第{w.i}个div, height: {w.h}, width:
                            {w.w}
                        </div>
                    );
                })}
            </ReactDragLayout>
        </ReactLayoutContext>
    );
};

export default ResizableDragResponsiveLayout;
