import {
    DragResult,
    DragStart,
    DropResult,
    LayoutItem,
    WidgetType
} from '@dpdfe/react-layout';
import { useEffect, useState } from 'react';

const useWidgets = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return [
            {
                x: 230,
                y: 230,
                w: 220,
                h: 120,
                i: '0',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.drag,
                has_inner_layout: false
            },
            {
                x: 0,
                y: 0,
                w: 4,
                h: 10,
                i: '1',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                has_inner_layout: true
            },
            {
                x: 0,
                y: 5,
                w: 2,
                h: 5,
                i: '2',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                has_inner_layout: false
            },
            {
                x: 5,
                y: 0,
                w: 4,
                h: 10,
                i: '3',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                has_inner_layout: true
            }
        ];
    }

    const context_props = {
        onChange: (result: DragResult) => {
            console.log(result, 'onChange');
            const { source, destination } = result;
            setWidgets(source.widgets);
        },
        onDragStart: (start: DragStart) => console.log(start, 'on drag start'),
        onDragStop: (result: DragResult) => console.log(result, 'on drag stop'),
        onResize: (start: DragStart) => console.log(start, 'on resize'),
        onResizeStart: (result: DragStart) =>
            console.log(result, 'on resize start'),
        onResizeStop: (result: DragStart) =>
            console.log(result, 'on resize stop'),
        onDrop: (result: DropResult) => {
            console.log(result, 'on drop');
            const { source, widget } = result;
            const drop_element = JSON.parse(
                JSON.stringify({
                    ...widget,
                    i: source.widgets.length.toString() + Math.random(),
                    is_resizable: true,
                    is_draggable: true
                })
            );
            const new_widgets = source.widgets.concat([drop_element]);
            console.log('add widgets', new_widgets);
            setWidgets(new_widgets);
            return drop_element;
        }
    };

    return {
        widgets,
        context_props
    };
};

export default useWidgets;
