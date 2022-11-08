import {
    LayoutItem,
    LayoutMode,
    LayoutType,
    ReactLayout,
    ReactLayoutContext,
    WidgetType
} from '@dpdfe/react-layout';
import { Button } from 'antd';
import React, { useContext, useEffect, useState } from 'react';

// 目标，如果没有高度就获取子元素渲染完成以后的高度配置到h上
/**
 * 1.如果是is_flex，h,y不进行转化，使用绝对值计算，进行排位挤占
 * 2.flex情况下，height auto，使用子元素的高度，set Layout rerender layout
 *
 * 在y定位失效的情况下，重新根据h计算 y,h,inner_h
 * @returns
 */

function Flex() {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);
    const [show_label, setShowLabel] = useState<boolean>(false);

    function generateLayout() {
        return [
            {
                w: 30,
                h: 1,
                x: 0,
                y: 0,
                is_flex: true,
                i: '0',
                chart_id: 10086,
                component_type: 'form_number',
                is_draggable: true,
                is_resizable: true,
                min_h: 5,
                min_w: 8,
                type: 'grid',
                refresh: 1
            },

            {
                w: 30,
                h: 1,
                x: 0,
                y: 15,
                is_flex: true,
                i: '10088',
                chart_id: 10088,
                component_type: 'form_text',
                is_draggable: true,
                is_resizable: true,
                min_h: 2,
                min_w: 2,
                type: 'grid',
                refresh: 1
            },
            {
                w: 30,
                h: 1,
                x: 0,
                y: 20,
                is_flex: true,
                i: '10089',
                chart_id: 10089,
                component_type: 'form_text',
                is_draggable: true,
                is_resizable: true,
                min_h: 2,
                min_w: 2,
                type: 'grid',
                refresh: 1
            },
            {
                w: 30,
                h: 1,
                x: 0,
                y: 25,
                is_flex: true,
                i: '10090',
                chart_id: 10087,
                component_type: 'form_btn',
                is_draggable: true,
                is_resizable: true,
                min_h: 2,
                min_w: 2,
                type: 'grid',
                refresh: 1
            }
        ];
    }

    useEffect(() => {
        setWidgets(generateLayout());

        setTimeout(() => {
            setShowLabel(true);
        }, 3000);
    }, []);

    return (
        <>
            <Button type='primary' style={{ marginRight: 10 }} draggable={true}>
                拖拽添加
            </Button>
            <ReactLayoutContext
                onChange={(result: LayoutResult) => {
                    console.log(result);
                    const { source, destination } = result;
                    setWidgets(source.widgets);
                }}
            >
                <ReactLayout
                    style={{
                        background: '#fff'
                    }}
                    layout_id={'widgets'}
                    widgets={widgets}
                    layout_type={LayoutType.GRID}
                    mode={LayoutMode.edit}
                    container_padding={[15]}
                    row_height={10}
                    cols={8}
                    draggable_cancel_handler={'.draggable_cancel_handler'}
                    item_margin={[10, 10]}
                    width={800}
                    is_droppable={true}
                    need_drag_bound={false}
                    need_grid_bound={true}
                    is_nested_layout={true}
                >
                    {widgets.map((w) => {
                        return (
                            <div
                                key={w.i}
                                data-drag={w}
                                style={{
                                    border: '1px solid',
                                    background: '#cddc39'
                                }}
                            >
                                <div className='test'>
                                    <span
                                        style={{
                                            color: 'red'
                                        }}
                                    ></span>
                                    {show_label && <p>我是一行新字</p>}
                                    我是第{w.i}
                                    个div, x: {w.x}, y: {w.y}, height: {w.h},
                                    width:
                                    {w.w}
                                    <button
                                        onClick={() => {
                                            setWidgets(
                                                widgets.filter(
                                                    (_w) => _w.i !== w.i
                                                )
                                            );
                                        }}
                                    >
                                        删除
                                    </button>
                                    <div
                                        style={{
                                            background: '#096dd9',
                                            height: 30
                                        }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </ReactLayout>
            </ReactLayoutContext>
        </>
    );
}

export default Flex;
