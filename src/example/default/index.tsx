import React, { useEffect, useState } from 'react';
import { Button, Input, Slider } from 'antd';
import {
    ReactLayout,
    LayoutType,
    LayoutItem,
    DirectionType,
    ItemPos,
    ReactLayoutContext,
    DragStart,
    DragResult,
    DropResult,
    LayoutMode,
    WidgetType
} from '@dpdfe/react-layout';
import 'antd/dist/antd.css';

import { Tabs } from 'antd';

const { TabPane } = Tabs;

const DefaultLayout = () => {
    const [width, setWidth] = useState<number | string>(400);
    const [height, setHeight] = useState<number | string>(400);
    const [scale, setScale] = useState<number>(1);
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);
    const [widgets2, setWidgets2] = useState<LayoutItem[]>([]);
    const [widgets3, setWidgets3] = useState<LayoutItem[]>([]);
    const [guide_line, setGuideLine] = useState<
        {
            x: number;
            y: number;
            direction: DirectionType;
        }[]
    >([]);

    useEffect(() => {
        setWidgets(generateLayout());
        setWidgets2(generateLayout2());
        setWidgets3(generateLayout3());
    }, []);

    function generateLayout3() {
        return [
            {
                i: '3-0',
                w: 100,
                h: 100,
                x: 100,
                y: 100,
                type: WidgetType.drag,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            },
            {
                i: '3-1',
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            }
        ];
    }

    function generateLayout2() {
        return [
            {
                i: '1-0',
                w: 100,
                h: 100,
                x: 100,
                y: 100,
                need_border_draggable_handler: true,
                type: WidgetType.drag,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            },
            {
                i: '1-1',
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                is_sticky: true,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            },
            {
                i: '1-2',
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                is_sticky: true,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            },
            {
                i: '1-3',
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                is_sticky: true,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            },
            {
                i: '1-4',
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                is_sticky: true,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            },
            {
                i: '1-5',
                w: 2,
                h: 2,
                x: 0,
                y: 0,
                is_sticky: true,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_nested: false
            }
        ];
    }

    function generateLayout() {
        return [
            {
                x: 630,
                y: 230,
                w: 200,
                h: 100,
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
                is_sticky: true,
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
                is_sticky: true,
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
                // is_sticky: true,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid,
                has_inner_layout: true
            },
            {
                x: 0,
                y: 10,
                w: 2,
                h: 3,
                i: '6',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid
            },
            {
                x: 0,
                y: 20,
                w: 2,
                h: 4,
                i: '7',
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid
            },
            {
                x: 0,
                y: 1,
                w: 2,
                h: 3,
                i: '8',
                is_sticky: true,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid
            },
            {
                x: 0,
                y: 1,
                w: 2,
                h: 2,
                i: '9',
                is_sticky: true,
                is_resizable: true,
                is_draggable: true,
                type: WidgetType.grid
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
        //         type: WidgetType.grid,
        //     };
        // });
    }

    const handleWidgetsChange = (id: string, widgets: LayoutItem[]) => {
        switch (id) {
            case 'root':
                setWidgets(widgets);
                break;
            case 'tab 1':
                setWidgets2(widgets);
                break;
            case 'widgets3':
                setWidgets3(widgets);
        }
    };

    const widgets3_component = () => {
        return (
            <ReactLayout
                style={{
                    background: '#fff'
                }}
                is_droppable={true}
                layout_id={'widgets3'}
                widgets={widgets3}
                layout_type={LayoutType.GRID}
                mode={LayoutMode.edit}
                container_padding={[10, 10, 10, 10]}
                row_height={50}
                cols={8}
                item_margin={[10, 10]}
                need_drag_bound={false}
                need_grid_bound={false}
                is_nested_layout={true}
                onDrop={(layout: LayoutItem[], item: ItemPos) => {
                    const drop_element = JSON.parse(
                        JSON.stringify({
                            ...item,
                            i: Math.random(),
                            is_resizable: true,
                            is_draggable: true
                        })
                    );

                    drop_element.i ||
                        (drop_element.i =
                            '1-' +
                            widgets3.length.toString() +
                            '-' +
                            Math.random());

                    const new_widgets = layout.concat([drop_element]);

                    setWidgets3(new_widgets);
                    console.log('add widgets3');

                    return drop_element;
                }}
            >
                {widgets3.map((w) => {
                    return (
                        <div
                            key={w.i}
                            data-drag={w}
                            style={{
                                border: '1px solid',
                                background:
                                    w.type === WidgetType.drag
                                        ? '#9eb3f1'
                                        : '#cddc39'
                            }}
                        >
                            <div className='test'>
                                <span
                                    style={{
                                        color: 'red'
                                    }}
                                ></span>
                                我是第{w.i}
                                个div, x: {w.x}, y: {w.y}, height: {w.h}, width:
                                {w.w}
                            </div>
                        </div>
                    );
                })}
            </ReactLayout>
        );
    };

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
                        background: '#ddd'
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
                <ReactLayoutContext
                    onChange={(result: DragResult) => {
                        console.log(result, 'onChange');
                        const { source, destination } = result;
                        handleWidgetsChange(source.layout_id, source.widgets);
                        destination &&
                            handleWidgetsChange(
                                destination.layout_id,
                                destination.widgets
                            );
                    }}
                    onDragStart={(start: DragStart) =>
                        console.log(start, 'on drag start')
                    }
                    onDragStop={(result: DragResult) => {
                        console.log(result, 'on drag stop');
                        // const { source, destination } = result;
                        // handleWidgetsChange(source.layout_id, source.widgets);
                        // destination &&
                        //     handleWidgetsChange(
                        //         destination.layout_id,
                        //         destination.widgets
                        //     );
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
                    onDrop={(result: DropResult) => {
                        console.log(result, 'on drop');
                        const { source, widget } = result;
                        const drop_element = JSON.parse(
                            JSON.stringify({
                                ...widget,
                                i:
                                    source.widgets.length.toString() +
                                    Math.random(),
                                is_resizable: true,
                                is_draggable: true
                            })
                        );

                        const new_widgets = source.widgets.concat([
                            drop_element
                        ]);
                        console.log('add widgets', new_widgets);
                        handleWidgetsChange(source.layout_id, new_widgets);
                        return drop_element;
                    }}
                >
                    <ReactLayout
                        is_droppable={true}
                        // getDroppingItem={() => {
                        //     return {
                        //         h: 2,
                        //         w: 2,
                        //         i: 'drop_element'
                        //     };
                        // }}
                        style={{ background: '#fff' }}
                        need_ruler
                        widgets={widgets}
                        layout_id={'root'}
                        layout_type={LayoutType.GRID}
                        width={width}
                        height={height}
                        row_height={50}
                        cols={8}
                        item_margin={[10, 10]}
                        container_padding={[10]}
                        scale={scale}
                        need_grid_lines={true}
                        need_drag_bound={false}
                        need_grid_bound={false}
                        guide_lines={guide_line}
                        mode={LayoutMode.edit}
                        // need_ruler={true}
                        // onDrop={(layout: LayoutItem[], item: ItemPos) => {
                        //     const drop_element = JSON.parse(
                        //         JSON.stringify({
                        //             ...item,
                        //             i: Math.random(),
                        //             is_resizable: true,
                        //             is_draggable: true
                        //         })
                        //     );
                        //     drop_element.i ||
                        //         (drop_element.i = layout.length.toString());

                        //     const new_widgets = layout.concat([drop_element]);
                        //     setWidgets(new_widgets);
                        //     console.log('add widgets', new_widgets);
                        //     return drop_element;
                        // }}
                        onDragStart={() => {
                            // console.log('onDragStart');
                        }}
                        // onDrag={(layout: LayoutItem[]) => {
                        //     console.log('onDrag');
                        //     setWidgets(layout);
                        // }}
                        onDragStop={(layout: LayoutItem[]) => {
                            // console.log(layout);
                            // console.log('onDragStop', 'root');
                            // setWidgets(layout);
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
                            setGuideLine(
                                guide_line.concat([{ x, y, direction }])
                            );
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
                                        background:
                                            w.type === WidgetType.drag
                                                ? '#9eb3f1'
                                                : '#cddc39',
                                        border: '1px solid',
                                        padding: 10,
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {
                                        <div className='test'>
                                            我是第{w.i}个div, x: {w.x}, y: {w.y}
                                            , height: {w.h}, width:
                                            {w.w}
                                        </div>
                                    }
                                    {w.i === '3' && widgets3_component()}
                                    {w.i === '1' && (
                                        <Tabs
                                            defaultActiveKey='1'
                                            onChange={(key) => {
                                                console.log(key);
                                            }}
                                            style={{
                                                height: '100%',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <TabPane tab='Tab 1' key='1'>
                                                <ReactLayout
                                                    is_droppable={true}
                                                    style={{
                                                        background: '#fff'
                                                    }}
                                                    widgets={widgets2}
                                                    layout_id={'tab 1'}
                                                    layout_type={
                                                        LayoutType.GRID
                                                    }
                                                    mode={LayoutMode.edit}
                                                    container_padding={[0]}
                                                    row_height={50}
                                                    cols={8}
                                                    item_margin={[10, 10]}
                                                    need_drag_bound={false}
                                                    need_grid_bound={false}
                                                    is_nested_layout={true}
                                                >
                                                    {widgets2.map((w) => {
                                                        return (
                                                            <div
                                                                key={w.i}
                                                                data-drag={w}
                                                                style={{
                                                                    border: '1px solid',
                                                                    background:
                                                                        w.type ===
                                                                        WidgetType.drag
                                                                            ? '#9eb3f1'
                                                                            : '#cddc39'
                                                                }}
                                                            >
                                                                {w.i === '3' ? (
                                                                    widgets3_component()
                                                                ) : (
                                                                    <div className='test'>
                                                                        <span
                                                                            style={{
                                                                                color: 'red'
                                                                            }}
                                                                        >
                                                                            {new Date().getTime()}
                                                                        </span>
                                                                        我是第
                                                                        {w.i}
                                                                        个div,
                                                                        x: {w.x}
                                                                        , y:{' '}
                                                                        {w.y},
                                                                        height:{' '}
                                                                        {w.h},
                                                                        width:
                                                                        {w.w}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </ReactLayout>
                                            </TabPane>
                                            <TabPane tab='Tab 2' key='2'>
                                                <ReactLayout
                                                    is_droppable={true}
                                                    style={{
                                                        background: '#fff'
                                                    }}
                                                    widgets={widgets2}
                                                    layout_id={'tab 2'}
                                                    layout_type={
                                                        LayoutType.GRID
                                                    }
                                                    mode={LayoutMode.edit}
                                                    container_padding={[
                                                        10, 10, 10, 10
                                                    ]}
                                                    row_height={50}
                                                    cols={8}
                                                    item_margin={[10, 10]}
                                                    need_drag_bound={false}
                                                    need_grid_bound={false}
                                                >
                                                    <div
                                                        data-drag={{
                                                            i: '2-0',
                                                            w: 200,
                                                            h: 200,
                                                            x: 100,
                                                            y: 100,
                                                            type: WidgetType.drag,
                                                            is_resizable: true,
                                                            is_draggable: true
                                                        }}
                                                        style={{
                                                            border: '1px solid'
                                                        }}
                                                    >
                                                        <div className='test'>
                                                            我是第0个div,
                                                            height: {w.h},
                                                            width:
                                                            {w.w}
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            border: '1px solid'
                                                        }}
                                                        data-drag={{
                                                            i: '2-1',
                                                            w: 2,
                                                            h: 2,
                                                            x: 0,
                                                            y: 0,
                                                            type: WidgetType.grid,
                                                            is_resizable: true,
                                                            is_draggable: true
                                                        }}
                                                    >
                                                        <div className='test'>
                                                            我是第1个div,
                                                            height: {w.h},
                                                            width:
                                                            {w.w}
                                                        </div>
                                                    </div>
                                                </ReactLayout>
                                            </TabPane>
                                            <TabPane tab='Tab 3' key='3'>
                                                <ReactLayout
                                                    is_droppable={true}
                                                    style={{
                                                        background: '#fff'
                                                    }}
                                                    layout_id={'tab 3'}
                                                    layout_type={
                                                        LayoutType.GRID
                                                    }
                                                    mode={LayoutMode.edit}
                                                    container_padding={[
                                                        10, 10, 10, 10
                                                    ]}
                                                    row_height={50}
                                                    cols={8}
                                                    item_margin={[10, 10]}
                                                    need_drag_bound={false}
                                                    need_grid_bound={false}
                                                >
                                                    <div
                                                        data-drag={{
                                                            i: '3-0',
                                                            w: 100,
                                                            h: 100,
                                                            x: 100,
                                                            y: 100,
                                                            type: WidgetType.drag,
                                                            is_resizable: true,
                                                            is_draggable: true
                                                        }}
                                                        style={{
                                                            border: '1px solid'
                                                        }}
                                                    >
                                                        <div className='test'>
                                                            我是第0个div,
                                                            height: {w.h},
                                                            width:
                                                            {w.w}
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            border: '1px solid'
                                                        }}
                                                        data-drag={{
                                                            i: '3-1',
                                                            w: 4,
                                                            h: 4,
                                                            x: 0,
                                                            y: 0,
                                                            type: WidgetType.grid,
                                                            is_resizable: true,
                                                            is_draggable: true
                                                        }}
                                                    >
                                                        <div className='test'>
                                                            我是第1个div,
                                                            height: {w.h},
                                                            width:
                                                            {w.w}
                                                        </div>
                                                    </div>
                                                </ReactLayout>
                                            </TabPane>
                                        </Tabs>
                                    )}
                                    {/* <Button
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
                                                    type: WidgetType.grid,
                                                }
                                            ])
                                        );
                                    }}
                                >
                                    删除我自己
                                </Button> */}
                                </div>
                            );
                        })}
                    </ReactLayout>
                </ReactLayoutContext>
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

export default DefaultLayout;
