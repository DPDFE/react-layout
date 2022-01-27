import React, { useEffect, useRef, useState } from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import Canvas from '../canvas';
import styles from './styles.module.css';
import { getMaxWidgetsRange } from '@/utils/utils';
import { LayoutType, ReactDragLayoutProps } from '@/interfaces';
import { addEvent, removeEvent } from 'event-utils';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const canvas_viewport = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动

    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    /**
     * 更改画布宽高属性
     */
    const changeCanvasAttrs = () => {
        // 画板计算大小
        const { wrapper_calc_width, wrapper_calc_height } = getMaxWidgetsRange(
            props.mode,
            props.width,
            props.height,
            props.scale
        );

        // 视窗的宽、高度
        const client_height = canvas_viewport.current?.clientHeight
            ? canvas_viewport.current?.clientHeight
            : 0;
        const client_width = canvas_viewport.current?.clientWidth
            ? canvas_viewport.current?.clientWidth
            : 0;

        // 画板实际大小
        const wrapper_width =
            wrapper_calc_width > client_width
                ? wrapper_calc_width
                : client_width;
        const wrapper_height =
            wrapper_calc_height > client_height
                ? wrapper_calc_height
                : client_height;

        // 视窗的宽、高度 和 画布+边距 缩放后宽、高度，取较大值 = 存放画布大小
        setCanvasWrapperWidth(wrapper_width);
        setCanvasWrapperHeight(wrapper_height);
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
                    canvas_viewport={canvas_viewport}
                ></HorizontalRuler>
            )}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* 垂直标尺 */}
                {props.mode === LayoutType.edit && canvas_viewport.current && (
                    <VerticalRuler
                        {...props}
                        wrapper_height={wrapper_height}
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
                        className={styles.canvas_wrapper}
                        style={{ width: wrapper_width, height: wrapper_height }}
                    >
                        {/* 实际画布区域 */}
                        <Canvas {...props}></Canvas>
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
