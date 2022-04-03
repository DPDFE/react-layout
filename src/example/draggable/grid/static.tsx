import React, { useEffect, useState } from 'react';
import {
    ReactLayout,
    LayoutType,
    LayoutItem,
    LayoutMode,
    ReactLayoutContext,
    WidgetType
} from '@dpdfe/react-layout';
import '@dpdfe/react-layout/dist/index.css';

const DraggableGridStaticLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 12 }).map((_, i) => {
            const random = parseInt((Math.random() * 10).toFixed());
            return {
                w: 2,
                h: 10,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid
            };
        });
    }

    return (
        <ReactLayoutContext>
            <ReactLayout
                widgets={widgets}
                style={{ background: '#fff' }}
                need_ruler
                height={600}
                width={600}
                container_padding={[10]}
                item_margin={[10, 10]}
                need_grid_bound={true}
                layout_type={LayoutType.DRAG}
                mode={LayoutMode.edit}
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

export default DraggableGridStaticLayout;
