import { LayoutItem, LayoutMode, LayoutType, ReactLayout, ReactLayoutContext, WidgetType } from '@dpdfe/react-layout';
import { Button } from 'antd';
import * as echarts from 'echarts';
import React, { useEffect, useState } from 'react';
import './styles.css';


const DraggableChartReRenderResponsiveLayout = () => {
    const [widgets, setWidgets] = useState<LayoutItem[]>([]);


    useEffect(() => {
        const widgets = generateLayout();
        setWidgets(widgets);

        setTimeout(() => {
            widgets.forEach((w) => {
                const chartDom = document.getElementById('chart' + w.i)!;
                const myChart = echarts.init(chartDom);
                const option = {
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            data: [150, 230, 224, 218, 135, 147, 260],
                            type: 'line'
                        }
                    ]
                };

                myChart.setOption(option);
            });
        }, 100);
    }, []);

    function generateLayout() {
        return [
            {
                w: 2,
                h: 20,
                i: 'chart0',
                x: 0,
                y: 0,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            },
            {
                w: 2,
                h: 20,
                i: 'chart1',
                x: 2,
                y: 0,
                is_resizable: false,
                is_draggable: true,
                type: WidgetType.grid,
                is_nested: false,
                draggable_cancel_handler: '.draggable-cancel'
            }
        ];
    }


    return (
        <ReactLayoutContext>
            <ReactLayout
                layout_id={'root'}
                // need_ruler
                style={{ background: '#fff' }}
                layout_type={LayoutType.GRID}
                mode={LayoutMode.edit}
                container_padding={[5]}
                item_margin={[10, 10]}
            >
                {widgets.map((w) => {
                    return (
                        <div
                            className={'widget_item'}
                            key={w.i}
                            data-drag={w}
                            style={{
                                border: '1px solid',
                                padding: 10
                            }}
                        >
                            <div>
                                <Button
                                    onClick={() => {
                                        setWidgets(
                                            widgets.filter((_) => _.i !== w.i)
                                        );
                                    }}
                                >
                                    删除
                                </Button>
                                我是{w.i}
                                <div id={'chart' + w.i} style={{ width: '100%', height: 350 }}></div>
                            </div>
                        </div>
                    );
                })}
            </ReactLayout>
        </ReactLayoutContext>
    );
};

export default DraggableChartReRenderResponsiveLayout;
