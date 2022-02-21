import React, { useEffect, useRef, useState } from 'react';
import VerticalRuler from '../vertical-ruler';
import HorizontalRuler from '../horizontal-ruler';
import Canvas, { CanvasRef } from '../canvas';
import { getMaxWidgetsRange } from './calc';
import styles from './styles.module.css';
import {
    BoundType,
    DragLayoutProps,
    GridType,
    LayoutType,
    MarginType,
    ReactDragLayoutProps,
    RulerPointer
} from '@/interfaces';
import { addEvent, removeEvent } from '@pearone/event-utils';
import GuideLine from '../guide-line';
import { DEFAULT_BOUND } from '../canvas/draggable';
import { noop } from '@/utils/utils';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
    const container_ref = useRef<HTMLDivElement>(null);
    const canvas_viewport = useRef<HTMLDivElement>(null); // 画布视窗，可视区域
    const canvas_wrapper = useRef<HTMLDivElement>(null); // canvas存放的画布，增加边距支持滚动
    const canvas_ref = useRef<CanvasRef>(null);

    const [wrapper_width, setCanvasWrapperWidth] = useState<number>(0); // 画板宽度
    const [wrapper_height, setCanvasWrapperHeight] = useState<number>(0); // 画板高度

    const [current_width, setCurrentWidth] = useState<number>(0); //宽度
    const [current_height, setCurrentHeight] = useState<number>(0); //高度

    const [t_offset, setTopOffset] = useState<number>(0); //垂直偏移量
    const [l_offset, setLeftOffset] = useState<number>(0); //水平偏移量

    const [ruler_hover_pos, setRulerHoverPos] = useState<RulerPointer>(); //尺子hover坐标

    const [grid, setGrid] = useState<GridType>({ col_width: 1, row_height: 1 });
    const [bound, setBound] = useState<BoundType>(DEFAULT_BOUND);
    const [padding, setPadding] = useState<MarginType>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    });

    /**
     * 更改画布宽高属性
     */
    const changeCanvasAttrs = () => {
        // 画板计算大小
        const {
            padding,
            grid,
            bound,
            t_offset,
            l_offset,
            current_height,
            current_width,
            wrapper_calc_width,
            wrapper_calc_height
        } = getMaxWidgetsRange(canvas_viewport, container_ref, props);

        setPadding(padding);
        setGrid(grid);
        setBound(bound);
        setCanvasWrapperWidth(wrapper_calc_width);
        setCanvasWrapperHeight(wrapper_calc_height);
        setCurrentHeight(current_height);
        setCurrentWidth(current_width);
        setTopOffset(t_offset);
        setLeftOffset(l_offset);
    };

    useEffect(() => {
        changeCanvasAttrs();
        addEvent(window, 'resize', changeCanvasAttrs);
        return () => {
            removeEvent(window, 'resize', changeCanvasAttrs);
        };
    }, [
        (props as DragLayoutProps).height,
        (props as DragLayoutProps).width,
        props.scale,
        props.children
    ]);

    return (
        <div
            className={`react-drag-layout ${styles.container}`}
            ref={container_ref}
        >
            {/* 水平标尺 */}
            {props.mode === LayoutType.edit && canvas_viewport.current && (
                <HorizontalRuler
                    {...props}
                    width={current_width}
                    l_offset={l_offset!}
                    wrapper_width={wrapper_width}
                    setRulerHoverPos={setRulerHoverPos}
                    canvas_viewport={canvas_viewport}
                ></HorizontalRuler>
            )}

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* 垂直标尺 */}
                {props.mode === LayoutType.edit && canvas_viewport.current && (
                    <VerticalRuler
                        {...props}
                        height={current_height}
                        t_offset={t_offset!}
                        wrapper_height={wrapper_height}
                        setRulerHoverPos={setRulerHoverPos}
                        canvas_viewport={canvas_viewport}
                    ></VerticalRuler>
                )}

                {/* 可视区域窗口 */}
                <div
                    style={{ overflow: 'auto', position: 'relative', flex: 1 }}
                    ref={canvas_viewport}
                    id={'canvas_viewport'}
                >
                    {/* 画板区域 */}
                    <div
                        id={'canvas_wrapper'}
                        ref={canvas_wrapper}
                        style={{
                            width: wrapper_width,
                            height: wrapper_height
                        }}
                        /** 阻止了onDragOver以后，onDrop事件才生效 */
                        onDrop={
                            props.mode === LayoutType.edit
                                ? canvas_ref.current?.onDrop
                                : noop
                        }
                        onDragOver={
                            props.mode === LayoutType.edit
                                ? canvas_ref.current?.onDragOver
                                : noop
                        }
                        onDragLeave={
                            props.mode === LayoutType.edit
                                ? canvas_ref.current?.onDragLeave
                                : noop
                        }
                        onMouseUp={canvas_ref.current?.onMouseUp}
                    >
                        {/* 实际画布区域 */}
                        {current_width && current_height && grid && (
                            <Canvas
                                {...props}
                                ref={canvas_ref}
                                padding={padding}
                                grid={grid}
                                bound={bound}
                                width={current_width}
                                height={current_height}
                                row_height={
                                    props.row_height
                                        ? props.row_height
                                        : current_height
                                }
                                t_offset={t_offset}
                                l_offset={l_offset}
                            ></Canvas>
                        )}
                    </div>
                </div>
            </div>

            {/* {props.mode === LayoutType.edit && canvas_viewport.current && (
                <GuideLine
                    scale={(props as DragLayoutProps).scale}
                    t_offset={t_offset}
                    l_offset={l_offset}
                    guide_lines={props.guide_lines}
                    canvas_viewport={canvas_viewport}
                    ruler_hover_pos={ruler_hover_pos}
                    removeGuideLine={props.removeGuideLine}
                ></GuideLine>
            )} */}
        </div>
    );
};

ReactDragLayout.defaultProps = {
    scale: 1,
    cols: 10,
    row_height: 20,
    container_padding: [10],
    item_margin: [0, 0],
    mode: LayoutType.view
};

export default ReactDragLayout;
