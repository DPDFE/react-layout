import React, { useEffect, useRef, useState } from 'react';
import HorizontalRuler from '../horizontal-ruler';
import VerticalRuler from '../vertical-ruler';
import Canvas from '../canvas';
import styles from './styles.module.css';
import { getMaxWidgetsRange } from '@/utils/utils';
import { ReactDragLayoutProps } from '@/interfaces';

const ReactDragLayout = (props: ReactDragLayoutProps) => {
  const [l_offset, setLeftOffset] = useState<number>(0); // 画布偏移量
  const [t_offset, setTopOffset] = useState<number>(0); // 画布偏移量

  const canvas_viewport = useRef<any>(); // 画布视窗，可视区域
  const canvas_wrapper = useRef<any>(); // canvas存放的画布，增加边距支持滚动

  // 可视窗口位置坐标（{x, y, left, top}）
  const wrapper_pos = canvas_viewport.current?.getBoundingClientRect();

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
    const client_height = canvas_viewport.current?.clientHeight;
    const client_width = canvas_viewport.current?.clientWidth;

    // 画板实际大小
    const wrapper_width =
      wrapper_calc_width > client_width ? wrapper_calc_width : client_width;
    const wrapper_height =
      wrapper_calc_height > client_height ? wrapper_calc_height : client_height;

    // 视窗的宽、高度 和 画布+边距 缩放后宽、高度，取较大值 = 存放画布大小
    setCanvasWrapperWidth(wrapper_width);
    setCanvasWrapperHeight(wrapper_height);
  };

  useEffect(() => {
    window.addEventListener('resize', changeCanvasAttrs, false);
    return () => {
      window.removeEventListener('resize', changeCanvasAttrs, false);
    };
  }, []);

  useEffect(() => {
    changeCanvasAttrs();
  }, [props.height, props.width, props.scale]);

  return (
    <div className={styles.container}>
      {/* 水平标尺 */}
      <HorizontalRuler
        height={props.height}
        scale={props.scale}
      ></HorizontalRuler>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 垂直标尺 */}
        <VerticalRuler width={props.width} scale={props.scale}></VerticalRuler>

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

export default ReactDragLayout;
