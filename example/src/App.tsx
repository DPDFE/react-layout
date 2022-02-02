import React, { useState } from 'react';
import { Button, Input, Slider } from 'antd';
import { ReactDragLayout, LayoutType, DragItem } from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';
import 'antd/dist/antd.css';

const App = () => {
    const [width, setWidth] = useState<number | string>(600);
    const [height, setHeight] = useState<number | string>(600);
    const [scale, setScale] = useState<number>(1);
    const widgets: DragItem[] = generateLayout();
    // console.log(widgets);

    const drag_config = {
        onDrop: (item: any) => {
            console.log('onDrop');
        },
        // onDragStart: () => {
        //     console.log('onDragStart');
        // },
        // onDrag: () => {
        //     console.log('onDrag');
        // },
        // onDragStop: (layout: any) => {
        //     console.log('onDragStop');
        // },
        onResizeStart: () => {
            console.log('onResizeStart');
        },
        onResizeStop: (layout: any) => {
            console.log('onResizeStop');
        }
    };

    function generateLayout() {
        return Array.from({ length: 1 }).map((_, i) => {
            return {
                x: i * 30 + 130,
                y: i * 100 + 300,
                w: 100,
                h: 100,
                i: i.toString(),
                is_resizable: true,
                is_draggable: true
            };
            // var y = Math.ceil(Math.random()) + 1;
            // return {
            //     x: Math.round(Math.random() * 16) * 100,
            //     y: Math.floor(i / 6) * y * 100,
            //     w: 2 * 100,
            //     h: y * 100,
            //     i: i.toString(),
            //     static: Math.random() < 0.05
            // };
        });
    }

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    height: '50px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#ddd',
                    marginBottom: 10
                }}
            >
                <Button type='primary' style={{ marginRight: 10 }}>
                    拖拽添加
                </Button>
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
                    min={0}
                    max={2}
                    onChange={setScale}
                />
            </div>

            <ReactDragLayout
                width={width}
                height={height}
                scale={scale}
                mode={LayoutType.edit}
                {...drag_config}
            >
                {widgets.map((w) => {
                    return (
                        <div
                            key={w.i}
                            data-drag={w}
                            // className={'app_class'}
                            id={`app_id_${w.i}`}
                            style={{ background: '#efefef' }}
                        >
                            <div className='test'>
                                我是第{w.i}个div, height: {w.h}, width:{w.w}
                            </div>
                        </div>
                    );
                })}
            </ReactDragLayout>
        </div>
    );
};

export default App;
