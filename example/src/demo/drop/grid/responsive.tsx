import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const DropGridResponsiveLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 6 }).map((_, i) => {
            const random = parseInt((Math.random() * 500).toFixed());
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
            <div>
                <Button
                    type='primary'
                    style={{ marginRight: 10 }}
                    draggable={true}
                >
                    拖拽添加
                </Button>
            </div>
            <ReactLayoutContext>
                <ReactDragLayout
                    need_ruler
                    layout_type={LayoutType.GRID}
                    mode={LayoutType.edit}
                    onDragStart={() => {
                        console.log('onDragStart');
                    }}
                    onDrag={(layout: LayoutItem[]) => {
                        console.log('onDrag');
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

export default DropGridResponsiveLayout;
