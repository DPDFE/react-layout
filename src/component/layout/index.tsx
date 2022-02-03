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

    // 让画布位于视窗中间
    const [t_scroll, setTopScroll] = useState<number>(0); //垂直滚动偏移量
    const [l_scroll, setLeftScroll] = useState<number>(0); //水平滚动偏移量
    const [init_scroll, setInitScroll] = useState<boolean>(false); //在初始状态时滚动

    const [fresh_count, setFreshCount] = useState<number>(0); // 刷新

    /**
     * 更改画布宽高属性
     */
    const changeCanvasAttrs = () => {
        // 画板计算大小
        const {
            wrapper_calc_width,
            wrapper_calc_height,
            t_offset,
            l_offset,
            t_scroll,
            l_scroll
        } = getMaxWidgetsRange(
            {
                ...props
            },
            canvas_viewport
        );
        setTopScroll(t_scroll);
        setLeftScroll(l_scroll);
        setInitScroll(true);

        setCanvasWrapperWidth(wrapper_calc_width);
        setCanvasWrapperHeight(wrapper_calc_height);
        setTopOffset(t_offset);
        setLeftOffset(l_offset);
    };

    useEffect(() => {
        canvas_viewport.current!.scrollLeft = l_scroll;
        canvas_viewport.current!.scrollTop = t_scroll;
    }, [init_scroll]);

    useEffect(() => {
        changeCanvasAttrs();
        addEvent(window, 'resize', changeCanvasAttrs);
        return () => {
            removeEvent(window, 'resize', changeCanvasAttrs);
        };
    }, [props.height, props.width, props.scale, fresh_count]);

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
                            fresh_count={fresh_count}
                            setFreshCount={setFreshCount}
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
