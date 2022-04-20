import React, { useEffect, useState } from 'react';
import {
    ReactLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext,
    DragStart,
    DragResult,
    LayoutMode,
    WidgetType
} from '@dpdfe/react-layout';
import './styles.css';

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
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            },
            {
                w: 2,
                h: 10,
                i: '1',
                x: 0,
                y: 0,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            },
            {
                w: 2,
                h: 10,
                i: '2',
                x: 5,
                y: 5,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            },
            {
                w: 2,
                h: 10,
                i: '3',
                x: 4,
                y: 4,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            },
            {
                w: 2,
                h: 10,
                i: '4',
                x: 8,
                y: 8,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            },
            {
                w: 2,
                h: 10,
                i: '5',
                x: 3,
                y: 3,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
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
        //         type: WidgetType.grid
        //     };
        // });
    }

    const handleWidgetsChange = (id: string, widgets: LayoutItem[]) => {
        switch (id) {
            case 'root':
                setWidgets(widgets);
                break;
        }
    };

    return (
        <ReactLayoutContext
            onDragStart={(start: DragStart) =>
                console.log(start, 'on drag start')
            }
            onDragStop={(result: DragResult) => {
                // console.log(result, 'on drag stop');
                const { source, destination } = result;
                handleWidgetsChange(source.layout_id, source.widgets);
                destination &&
                    handleWidgetsChange(
                        destination.layout_id,
                        destination.widgets
                    );
            }}
            onResize={(start: DragStart) => {
                // console.log(start, 'on resize');
            }}
            onResizeStart={(result: DragStart) => {
                console.log(result, 'on resize start');
            }}
            onResizeStop={(result: DragStart) => {
                console.log(result, 'on resize stop');
            }}
        >
            <ReactLayout
                layout_id={'root'}
                widgets={widgets}
                // need_ruler
                style={{ background: '#fff' }}
                layout_type={LayoutType.GRID}
                mode={LayoutMode.edit}
                container_padding={[5]}
                item_margin={[10, 10]}
                onDragStart={() => {
                    console.log('onDragStart');
                }}
                onDrag={(layout: LayoutItem[]) => {
                    // console.log('onDrag');
                }}
                onDragStop={(layout: LayoutItem[]) => {
                    console.log('onDragStop');
                    // setWidgets(layout);
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
                            <span
                                style={{ color: 'red' }}
                                className={'draggable-cancel'}
                            >
                                {new Date().getTime()}
                            </span>
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

export default DraggableGridResponsiveLayout;
