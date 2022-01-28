import React, { useEffect, useRef, useState } from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import Canvas from '../canvas';
import styles from './styles.module.css';
import { getMaxWidgetsRange } from '@/utils/utils';
import { LayoutType, ReactDragLayoutProps } from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const canvas_viewport = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动

    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [max_left, setMaxLeft] = useState<number>(0); // 左
    const [max_right, setMaxRight] = useState<number>(0); // 右
    const [max_top, setMaxTop] = useState<number>(0); // 上
    const [max_bottom, setMaxBottom] = useState<number>(0); // 下
    /**
     * 更改画布宽高属性
     */
    const changeCanvasAttrs = () => {
        // 画板计算大小
        const { wrapper_calc_width, wrapper_calc_height, t_offset, l_offset } =
            getMaxWidgetsRange(
                {
                    ...props
                },
                canvas_viewport
            );

        setCanvasWrapperWidth(wrapper_calc_width);
        setCanvasWrapperHeight(wrapper_calc_height);
        setTopOffset(t_offset);
        setLeftOffset(l_offset);

        setMaxLeft(max_left);
        setMaxRight(max_right);
        setMaxTop(max_top);
        setMaxBottom(max_bottom);
    };

    useEffect(() => {
        changeCanvasAttrs();
        addEvent(window, 'resize', changeCanvasAttrs);
        return () => {
            removeEvent(window, 'resize', changeCanvasAttrs);
        };
    }, [props.height, props.width, props.scale]);

    return (
        <div className={`react-drag-layout ${styles.container}`}>
            {/* 水平标尺 */}
            {props.mode === LayoutType.edit && canvas_viewport.current && (
                <HorizontalRuler
                    {...props}
                    wrapper_width={wrapper_width}
                    l_offset={l_offset}
                    canvas_viewport={canvas_viewport}
                ></HorizontalRuler>
            )}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* 垂直标尺 */}
                {props.mode === LayoutType.edit && canvas_viewport.current && (
                    <VerticalRuler
                        {...props}
                        wrapper_height={wrapper_height}
                        t_offset={t_offset}
                        canvas_viewport={canvas_viewport}
                    ></VerticalRuler>
                )}

                {/* 可视区域窗口 */}
                <div
                    style={{ overflow: 'auto', position: 'relative', flex: 1 }}
                    ref={canvas_viewport}
                >
                    {/* 画板区域 */}
                    <div
                        ref={canvas_wrapper}
                        style={{
                            width: wrapper_width,
                            height: wrapper_height
                        }}
                    >
                        {/* 实际画布区域 */}
                        <Canvas
                            {...props}
                            t_offset={t_offset}
                            l_offset={l_offset}
                        ></Canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReactDragLayout.defaultProps = {
    scale: 1,
    mode: LayoutType.view
};

export default ReactDragLayout;
