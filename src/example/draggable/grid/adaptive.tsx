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
import { Button } from 'antd';

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
                y: 10,
                is_sticky: false,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel',
                need_border_draggable_handler: false,
                is_droppable: false,
                is_dragging: false,
                moved: false
            },
            {
                w: 2,
                h: 10,
                i: '1',
                x: 3,
                y: 10,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                is_sticky: false,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel',
                need_border_draggable_handler: false,
                is_droppable: false,
                is_dragging: false,
                moved: false
            },
            {
                w: 2,
                h: 10,
                i: '2',
                x: 8,
                y: 10,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel',
                need_border_draggable_handler: false,
                is_droppable: false,
                is_dragging: false,
                moved: false
            },
            {
                w: 2,
                h: 10,
                i: '3',
                x: 4,
                y: 30,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel',
                need_border_draggable_handler: false,
                is_droppable: false,
                is_dragging: false,
                moved: false
            },
            {
                w: 2,
                h: 10,
                i: '4',
                x: 4,
                y: 20,
                is_resizable: true,
                is_draggable: true,
                is_sticky: false,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel',
                need_border_draggable_handler: false,
                is_droppable: false,
                is_dragging: false,
                moved: false
            },
            {
                w: 2,
                h: 10,
                i: '5',
                x: 0,
                y: 0,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel',
                need_border_draggable_handler: false,
                is_droppable: false,
                is_dragging: false,
                moved: false
            }
        ];
    }

    const handleWidgetsChange = (id: string, widgets: LayoutItem[]) => {
        switch (id) {
            case 'root':
                console.log(widgets);
                setWidgets(widgets);
                break;
        }
    };

    const color_lists = [
        '#e6ee1e',
        '#e8134d',
        '#5b7b67',
        '#e3b94d',
        '#b38618',
        '#0bb0d5',
        '#d021b1',
        '#076355',
        '#215ca7',
        '#e634d0',
        '#79c140',
        '#c45e90',
        '#c07dba',
        '#a122c9',
        '#45b76a',
        '#917646',
        '#61b3dc',
        '#40b76b',
        '#0bba41',
        '#edc558'
    ];

    const getRandomColor = () => {
        let color = '#';
        const randomArr = [
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'a',
            'b',
            'c',
            'd',
            'e',
            'f'
        ];
        for (var i = 0; i < 6; i++) {
            const a = Math.random() * 15;
            color += randomArr[parseInt(a.toString())];
        }
        return color;
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
                // console.log(source.widgets);
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
                is_droppable
                layout_id={'root'}
                widgets={widgets}
                // need_ruler
                style={{ background: '#fff' }}
                layout_type={LayoutType.GRID}
                mode={LayoutMode.edit}
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
                    // setWidgets(layout);
                }}
            >
                {widgets.map((w, idx) => {
                    const color = color_lists[idx];

                    return (
                        <div
                            key={w.i}
                            data-drag={w}
                            style={{
                                border: '1px solid',
                                padding: 10,
                                backgroundColor: color
                            }}
                        >
                            <Button
                                onClick={() => {
                                    setWidgets(
                                        widgets.filter((_) => _.i !== w.i)
                                    );
                                }}
                            >
                                删除
                            </Button>
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
