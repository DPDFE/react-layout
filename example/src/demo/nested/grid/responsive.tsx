import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

/**
 * TODO：
 * 1. 在drag状态下，页面会随着拖拽滚动
 */
const DragResponsiveLayout = () => {
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
                is_resizable: false,
                is_draggable: true,
                is_float: false
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
                    layout_type={LayoutType.GRID}
                    container_padding={[10]}
                    item_margin={[10, 10]}
                    mode={LayoutType.edit}
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
        </div>
    );
};

export default DragResponsiveLayout;
