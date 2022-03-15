import React, { useEffect, useState } from 'react';
import {
    ReactLayout,
    LayoutType,
    LayoutItem,
    LayoutMode,
    ReactLayoutContext
} from 'react-layout';
import 'react-layout/dist/index.css';

const ResizableGridResponsiveLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 6 }).map((_, i) => {
            const random = parseInt((Math.random() * 500).toFixed());
            return {
                w: 2,
                h: 10,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: true,
                is_draggable: true,
                is_float: false
            };
        });
    }

    return (
        <ReactLayoutContext>
            <ReactLayout
                widgets={widgets}
                style={{ background: '#fff' }}
                need_ruler
                layout_type={LayoutType.GRID}
                mode={LayoutMode.edit}
                container_padding={[10]}
                item_margin={[10, 10]}
                onResizeStart={() => {
                    console.log('onResizeStart');
                }}
                onResize={(layout: LayoutItem[]) => {
                    // console.log('onResize');
                }}
                onResizeStop={(layout: LayoutItem[]) => {
                    console.log('onResizeStop');
                    setWidgets(layout);
                }}
                onDragStart={() => {
                    console.log('onDragStart');
                }}
                onDrag={(layout: LayoutItem[]) => {
                    // console.log('onDrag');
                }}
                onDragStop={(layout: LayoutItem[]) => {
                    console.log('onDragStop');
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
            </ReactLayout>
        </ReactLayoutContext>
    );
};

export default ResizableGridResponsiveLayout;
