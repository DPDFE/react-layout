import React, { useEffect, useState } from 'react';
import {
    ReactLayout,
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
        return Array.from({ length: 2 }).map((_, i) => {
            const random = parseInt((Math.random() * 500).toFixed());
            return {
                w: 100,
                h: 100,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: true,
                is_draggable: true,
                is_float: true,
                need_mask: true
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
                mode={LayoutType.edit}
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
                            className={'widget_item'}
                            key={w.i}
                            data-drag={w}
                            style={{
                                border: '1px solid',
                                padding: 10
                            }}
                        >
                            <iframe
                                title='111'
                                src='http://www.baidu.com'
                                frameBorder='0'
                                width='100%'
                                height='100%'
                            ></iframe>
                            <div>
                                我是第{w.i}个div, height: {w.h}, width:
                                {w.w}
                            </div>
                        </div>
                    );
                })}
            </ReactLayout>
        </ReactLayoutContext>
    );
};

export default ResizableDragResponsiveLayout;
