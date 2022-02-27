import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const DraggableGridResponsiveLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        const widget = generateLayout();
        setWidgets(widget);
    }, []);

    function generateLayout() {
        return [
            {
                w: 2,
                h: 10,
                i: '0',
                x: 5,
                y: 5,
                is_resizable: false,
                is_draggable: true,
                is_float: false,
                is_unhoverable: false
            },
            {
                w: 2,
                h: 10,
                i: '1',
                x: 1,
                y: 1,
                is_resizable: false,
                is_draggable: true,
                is_float: false,
                is_unhoverable: false
            },
            {
                w: 2,
                h: 10,
                i: '2',
                x: 5,
                y: 5,
                is_resizable: false,
                is_draggable: true,
                is_float: false,
                is_unhoverable: false
            },
            {
                w: 2,
                h: 10,
                i: '3',
                x: 4,
                y: 4,
                is_resizable: false,
                is_draggable: true,
                is_float: false,
                is_unhoverable: false
            },
            {
                w: 2,
                h: 10,
                i: '4',
                x: 8,
                y: 8,
                is_resizable: false,
                is_draggable: true,
                is_float: false,
                is_unhoverable: false
            },
            {
                w: 2,
                h: 10,
                i: '5',
                x: 3,
                y: 3,
                is_resizable: false,
                is_draggable: true,
                is_float: false,
                is_unhoverable: false
            }
        ];
        // return Array.from({ length: 6 }).map((_, i) => {
        //     const random = parseInt((Math.random() * 10).toFixed());
        //     return {
        //         w: 2,
        //         h: 10,
        //         i: i.toString(),
        //         x: random,
        //         y: random,
        //         is_resizable: false,
        //         is_draggable: true,
        //         is_float: false
        //     };
        // });
    }

    return (
        <ReactLayoutContext>
            <ReactDragLayout
                need_ruler
                layout_type={LayoutType.GRID}
                mode={LayoutType.edit}
                container_padding={[10]}
                item_margin={[10, 10]}
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
            </ReactDragLayout>
        </ReactLayoutContext>
    );
};

export default DraggableGridResponsiveLayout;
