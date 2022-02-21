import React, { useEffect, useState } from 'react';
import { Button, Input, Slider } from 'antd';
import {
    ReactDragLayout,
    LayoutType,
    LayoutItem,
    DirectionType,
    ItemPos
} from 'react-drag-layout';
import 'react-drag-layout/dist/index.css';
import 'antd/dist/antd.css';

const App = () => {
    const [width, setWidth] = useState<number | string>(400);
    const [height, setHeight] = useState<number | string>(400);
    const [scale, setScale] = useState<number>(1);
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);
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
        return [
            {
                x: 230,
                y: 230,
                w: 100,
                h: 100,
                i: '0',
                is_resizable: true,
                is_draggable: true,
                is_float: true
            },
            {
                x: 0,
                y: 0,
                w: 2,
                h: 5,
                i: '1',
                is_resizable: true,
                is_draggable: true,
                is_float: false
            },
            {
                x: 0,
                y: 5,
                w: 2,
                h: 5,
                i: '5',
                is_resizable: true,
                is_draggable: true,
                is_float: false
            },
            {
                x: 0,
                y: 10,
                w: 2,
                h: 3,
                i: '6',
                is_resizable: true,
                is_draggable: true,
                is_float: false
            },
            {
                x: 2,
                y: 0,
                w: 2,
                h: 4,
                i: '2',
                is_resizable: true,
                is_draggable: true,
                is_float: false
            },
            {
                x: 4,
                y: 1,
                w: 2,
                h: 3,
                i: '3',
                is_resizable: true,
                is_draggable: true,
                is_float: false
            },
            {
                x: 6,
                y: 1,
                w: 2,
                h: 2,
                i: '4',
                is_resizable: true,
                is_draggable: true,
                is_float: false
            }
        ];
        // return Array.from({ length: 3 }).map((_, i) => {
        //     return {
        //         x: i * -30 + 230,
        //         y: i * 120 + 230,
        //         w: 1,
        //         h: 1,
        //         i: i.toString(),
        //         is_resizable: true,
        //         is_draggable: true,
        //         is_float: false
        //     };
        // });
    }

    return (
        <div
            style={{
                display: 'flex',
                height: '100%',
                overflow: 'hidden'
            }}
        >
            <div
                style={{ height: '100%', width: 30, background: '#607d8b' }}
            ></div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: `calc(100% - 60px)`
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
                    <Button
                        type='primary'
                        style={{ marginRight: 10 }}
                        draggable={true}
                    >
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
                        min={0.04}
                        max={2}
                        onChange={setScale}
                    />
                </div>

                <ReactDragLayout
                    // getDroppingItem={() => {
                    //     return {
                    //         h: 2,
                    //         w: 2,
                    //         i: 'drop_element'
                    //     };
                    // }}
                    layout_type={LayoutType.GRID}
                    width={width}
                    height={height}
                    row_height={50}
                    cols={8}
                    item_margin={[10, 10]}
                    container_padding={[10, 10, 10, 10]}
                    scale={scale}
                    guide_lines={guide_line}
                    mode={LayoutType.edit}
                    onDrop={(item: ItemPos) => {
                        const drop_element = JSON.parse(
                            JSON.stringify({
                                ...item,
                                i: widgets.length.toString(),
                                is_resizable: true,
                                is_draggable: true
                            })
                        );

                        const new_widgets = widgets.concat([drop_element]);
                        setWidgets(new_widgets);
                        return drop_element;
                    }}
                    onDragStart={() => {
                        // console.log('onDragStart');
                    }}
                    // onDrag={(layout: LayoutItem[]) => {
                    //     console.log('onDrag');
                    //     setWidgets(layout);
                    // }}
                    onDragStop={(layout: LayoutItem[]) => {
                        // console.log(layout);
                        // console.log('onDragStop');
                        setWidgets(layout);
                    }}
                    onResizeStart={() => {
                        // console.log('onResizeStart');
                    }}
                    // onResize={() => {
                    //     console.log('onResize');
                    // }}
                    onResizeStop={(layout: LayoutItem[]) => {
                        // console.log('onResizeStop');
                        setWidgets(layout);
                    }}
                    onPositionChange={(layout: LayoutItem[]) => {
                        // console.log('positionChange', layout);
                        setWidgets(layout);
                    }}
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
                                // className={'app_class'}
                                id={`app_id_${w.i}`}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid'
                                }}
                            >
                                <div className='test'>
                                    我是第{w.i}个div, height: {w.h}, width:{w.w}
                                </div>
                                <Button
                                    type='primary'
                                    style={{ marginRight: 10 }}
                                    onClick={() => {
                                        console.log('delete my self', widgets);
                                        setWidgets(
                                            widgets.concat([
                                                {
                                                    x: 2,
                                                    y: 0,
                                                    w: 2,
                                                    h: 4,
                                                    i: Math.random().toString(),
                                                    is_resizable: true,
                                                    is_draggable: true,
                                                    is_float: false
                                                }
                                            ])
                                        );
                                    }}
                                >
                                    删除我自己
                                </Button>
                                {/* <ReactDragLayout>
                                    <div
                                        data-drag={{ i: 1, w: 10, h: 10 }}
                                        style={{ background: '#000' }}
                                    ></div>
                                    <div
                                        data-drag={{
                                            i: 2,
                                            w: 10,
                                            h: 10,
                                            x: 100,
                                            y: 100
                                        }}
                                        style={{ background: '#000' }}
                                    ></div>
                                </ReactDragLayout> */}
                            </div>
                        );
                    })}
                </ReactDragLayout>
                <div
                    style={{ height: 30, width: '100%', background: '#607d8b' }}
                ></div>
            </div>
            <div
                style={{ height: '100%', width: 30, background: '#607d8b' }}
            ></div>
        </div>
    );
};

export default App;
