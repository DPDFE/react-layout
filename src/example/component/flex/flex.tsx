import {
    LayoutItem,
    LayoutMode,
    LayoutType,
    ReactLayout,
    ReactLayoutContext,
    WidgetType
} from '@dpdfe/react-layout';
import React, { useEffect, useState } from 'react';

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
            // {
            //     i: '1',
            //     w: 8,
            //     h: 2,
            //     x: 0,
            //     y: 0,
            //     type: WidgetType.grid,
            //     is_resizable: true,
            //     is_draggable: true,
            //     is_flex: false,
            //     layout_id: 'widgets',
            //     is_nested: false,
            //     is_droppable: true
            // },
            // {
            //     i: '2',
            //     w: 8,
            //     h: 2,
            //     x: 0,
            //     y: 0,
            //     type: WidgetType.grid,
            //     is_resizable: true,
            //     is_draggable: true,
            //     is_flex: true,
            //     layout_id: 'widgets',
            //     is_nested: false,
            //     is_droppable: true
            // },
            // {
            //     i: '3',
            //     w: 8,
            //     h: 2,
            //     x: 0,
            //     y: 0,
            //     type: WidgetType.grid,
            //     is_resizable: true,
            //     is_draggable: true,
            //     is_flex: true,
            //     layout_id: 'widgets',
            //     is_nested: false,
            //     is_droppable: true
            // },
            {
                i: '3',
                w: 3,
                h: 87,
                x: 0,
                y: 15,
                min_w: 1,
                type: 'grid',
                is_resizable: true,
                is_draggable: true,
                is_flex: true,
                layout_id: 'widgets',
                is_nested: false,
                is_droppable: true,
                need_border_draggable_handler: false,
                inner_h: 77
            },
            {
                i: '4',
                w: 3,
                h: 87,
                x: 0,
                y: 15,
                min_w: 1,
                type: 'grid',
                is_resizable: true,
                is_draggable: true,
                is_flex: true,
                layout_id: 'widgets',
                is_nested: false,
                is_droppable: true,
                need_border_draggable_handler: false,
                inner_h: 77
            },
            {
                i: '5',
                w: 8,
                h: 2,
                x: 0,
                y: 0,
                type: WidgetType.grid,
                is_resizable: true,
                is_draggable: true,
                is_flex: false,
                layout_id: 'widgets',
                is_nested: false,
                is_droppable: true
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
                                个div, x: {w.x}, y: {w.y}, height: {w.h}, width:
                                {w.w}
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
    );
}

export default Flex;
