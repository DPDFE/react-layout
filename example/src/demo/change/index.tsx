import { Input, Slider } from 'antd';
import React, { useEffect, useState } from 'react';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    ReactLayoutContext
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';

const ChangeDragLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);
    const [scale, setScale] = useState<number>(1);
    const [width, setWidth] = useState<number | string>(400);
    const [height, setHeight] = useState<number | string>(400);

    useEffect(() => {
        setWidgets(generateLayout());
    }, []);

    function generateLayout() {
        return Array.from({ length: 6 }).map((_, i) => {
            const boolean = Boolean(Math.round(Math.random()));
            const random = parseInt(
                (Math.random() * (boolean ? 500 : 10)).toFixed()
            );

            return {
                w: boolean ? 100 : 2,
                h: boolean ? 100 : 10,
                i: i.toString(),
                x: random,
                y: random,
                is_resizable: true,
                is_draggable: true,
                is_float: boolean
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
                <span>高度(px)：</span>
                <Input
                    style={{ marginRight: 10, width: 150 }}
                    value={height}
                    onChange={(e) => {
                        setHeight(parseInt(e.target.value));
                    }}
                ></Input>
                <span>宽度(px)：</span>
                <Input
                    value={width}
                    style={{ marginRight: 10, width: 150 }}
                    onChange={(e) => {
                        setWidth(parseInt(e.target.value));
                    }}
                ></Input>
                <span>缩放(100%)：</span>
                <Slider
                    value={scale}
                    style={{ marginRight: 10, width: 150 }}
                    step={0.04}
                    min={0.04}
                    max={2}
                    onChange={setScale}
                />
            </div>
            <ReactLayoutContext>
                <ReactDragLayout
                    // need_ruler
                    height={height}
                    width={width}
                    item_margin={[10, 10]}
                    container_padding={[10]}
                    layout_type={LayoutType.DRAG}
                    mode={LayoutType.edit}
                    need_drag_bound={false}
                    scale={scale}
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

export default ChangeDragLayout;
