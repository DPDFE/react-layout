import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext,
    ItemPos
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const DropDragStaticLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 6 }).map((_, i) => {
            const random = parseInt((Math.random() * 500).toFixed());
            return {
                w: 100,
                h: 100,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: false,
                is_draggable: true,
                is_float: true
            };
        });
    }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 10px'
                }}
            >
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
                    height={600}
                    width={1200}
                    layout_type={LayoutType.DRAG}
                    mode={LayoutType.edit}
                    need_drag_bound={false}
                    getDroppingItem={() => {
                        return {
                            h: 200,
                            w: 200,
                            i: 'drop_element'
                        };
                    }}
                    onDrop={(layout: LayoutItem[], item: ItemPos) => {
                        const drop_element = {
                            ...item,
                            i: widgets.length.toString(),
                            is_resizable: true,
                            is_draggable: true
                        };
                        const new_widgets = layout.concat([drop_element]);
                        setWidgets(new_widgets);
                        return drop_element;
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

export default DropDragStaticLayout;
