import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const ResizeLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 1 }).map((_, i) => {
            return {
                w: 300,
                h: 300,
                i: i.toString(),
                x: 150,
                y: 150,
                is_resizable: true,
                is_draggable: false,
                is_float: true
            };
        });
    }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <ReactLayoutContext>
                <ReactDragLayout
                    need_ruler
                    height={600}
                    width={600}
                    layout_type={LayoutType.DRAG}
                    mode={LayoutType.edit}
                    need_drag_bound={false}
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
        </div>
    );
};

export default ResizeLayout;
