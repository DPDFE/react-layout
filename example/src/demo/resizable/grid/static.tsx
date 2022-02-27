import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const ResizableGridStaticLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 6 }).map((_, i) => {
            const random = parseInt((Math.random() * 10).toFixed());
            return {
                w: 2,
                h: 10,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: true,
                is_draggable: false,
                is_float: false
            };
        });
    }

    return (
        <ReactLayoutContext>
            <ReactDragLayout
                need_ruler
                height={600}
                width={600}
                container_padding={[10]}
                item_margin={[10, 10]}
                layout_type={LayoutType.DRAG}
                mode={LayoutType.edit}
                need_grid_bound={false}
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

export default ResizableGridStaticLayout;
