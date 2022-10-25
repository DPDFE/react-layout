import React, { useEffect, useState } from 'react';
import {
    ReactLayout,
    LayoutType,
    LayoutItem,
    LayoutMode,
    ReactLayoutContext,
    WidgetType,
    DirectionType,
    LayoutResult,
    CompactItem
} from '@dpdfe/react-layout';

const ResizableDragStaticLayout = () => {
    const [widgets, setWidgets] = useState<CompactItem[]>([]);
    const [guide_line, setGuideLine] = useState<
        {
            x: number;
            y: number;
            direction: DirectionType;
        }[]
    >([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 1 }).map((_, i) => {
            const random = parseInt((Math.random() * 500).toFixed());
            return {
                w: 100,
                h: 100,
                i: i.toString(),
                x: random,
                y: random,
                layout_id: 'default',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.drag
            };
        });
    }

    return (
        <ReactLayoutContext
            onChange={(result: LayoutResult) => {
                const { source, destination } = result;
                destination &&
                    console.log(
                        JSON.parse(JSON.stringify(destination.widgets)),
                        'onChange'
                    );
                setWidgets(source.widgets);
            }}
        >
            <ReactLayout
                widgets={widgets}
                style={{ background: '#ddd' }}
                need_ruler
                height={600}
                width={1200}
                layout_type={LayoutType.DRAG}
                layout_id={'default'}
                mode={LayoutMode.edit}
                need_drag_bound={false}
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
                onChange={(layout: LayoutItem[]) => {
                    setWidgets(layout);
                }}
                guide_lines={guide_line}
                addGuideLine={({
                    x,
                    y,
                    direction
                }: {
                    x: number;
                    y: number;
                    direction: DirectionType;
                }) => {
                    setGuideLine(guide_line.concat([{ x, y, direction }]));
                }}
                removeGuideLine={({
                    x,
                    y,
                    direction
                }: {
                    x: number;
                    y: number;
                    direction: DirectionType;
                }) => {
                    setGuideLine(
                        guide_line.filter(
                            (line) =>
                                !(
                                    line.x === x &&
                                    line.y === y &&
                                    line.direction === direction
                                )
                        )
                    );
                }}
            >
                {widgets.map((w) => {
                    return (
                        <div
                            key={w.i}
                            data-drag={w}
                            style={{
                                border: '1px solid',
                                padding: '20px 15px'
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

export default ResizableDragStaticLayout;
