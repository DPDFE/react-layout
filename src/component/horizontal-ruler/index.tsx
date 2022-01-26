import { HorizontalRulerProps } from '@/interfaces';
import {
  fiveMultipleIntergral,
  reciprocalNum,
  RULER_GAP,
  TOP_RULER_LEFT_MARGIN
} from '@/utils/utils';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

const HorizontalRuler = (props: HorizontalRulerProps) => {
  const [x_offset, setXOffset] = useState<number[]>([]); // 尺子水平间隔
  const [l_offset, setLeftOffset] = useState<number>(0); // 画布偏移量
  const [ruler_offset_left, setRulerOffsetLeft] = useState<number>(0); // 尺子位移
  const [ruler_align_left, setRulerAlignLeft] = useState<number>(0); // 尺子校准偏移量

  /**
   * 计算水平方向尺子位置
   */
  const calcHorizontalRulerPos = () => {
    // 画布左上角偏移量（需要为5刻度的倍数）https://www.jianshu.com/p/a89732aa84af
    const { wrapper_width, width, scale, canvas_viewport } = props;

    const canvas_offset_left =
      (wrapper_width - width * scale) / 2 - canvas_viewport.current!.scrollLeft;

    setLeftOffset(canvas_offset_left);

    // 尺子0点偏移整数粒度计算
    const ruler_forward_x = Math.ceil(wrapper_width / RULER_GAP);
    const ruler_backward_x = Math.floor(canvas_offset_left / RULER_GAP);

    // 尺子非整数粒度计算（需要为5刻度的倍数）
    /* 因为标尺的0点和画布的0点为不同坐标，在计算完成后会出现标尺和画布0点坐标偏差的情况，
       通过margin更新整个尺子的位置，抵消掉为了映射刻度5，多带来的padding偏移量。*/
    const ruler_offset_left = canvas_offset_left - ruler_backward_x * RULER_GAP;

    const ruler_offset_correct_left = fiveMultipleIntergral(
      canvas_offset_left - ruler_backward_x * RULER_GAP
    );
    const ruler_align_left = ruler_offset_left - ruler_offset_correct_left;

    setRulerOffsetLeft(ruler_offset_correct_left);
    setRulerAlignLeft(ruler_align_left);

    setXOffset(reciprocalNum(ruler_backward_x, ruler_forward_x));
  };

  useEffect(() => {
    calcHorizontalRulerPos();
    props.canvas_viewport.current!.addEventListener(
      'scroll',
      calcHorizontalRulerPos,
      false
    );
    return () => {
      props.canvas_viewport.current!.removeEventListener(
        'scroll',
        calcHorizontalRulerPos,
        false
      );
    };
  }, [props.width, props.scale, props.wrapper_width]);

  return (
    <div>
      <ul
        className={styles.horizontal}
        style={{
          paddingLeft: ruler_offset_left,
          marginLeft: TOP_RULER_LEFT_MARGIN + ruler_align_left
        }}
        // onMouseMove={(e) => {
        //   e.persist();
        //   setHoverPos({
        //     x: e.clientX - wrapper_pos.x,
        //     y: 0
        //   });
        // }}
        // onMouseEnter={() => {
        //   if (!show_hover_pos) {
        //     setShowHoverPos(true);
        //   }
        // }}
        // onMouseLeave={() => {
        //   setShowHoverPos(false);
        // }}
        // onMouseDown={() => {
        //   if (hover_pos) {
        //     props.store.ruler_lines.push({
        //       x: parseInt(
        //         ((hover_pos.x - l_offset) / props.store.scale).toFixed(0)
        //       ),
        //       y: 0,
        //       direction: 'horizontal'
        //     });
        //     props.store.savePageStyles();
        //   }
        // }}
      >
        {x_offset.map((x) => {
          return (
            <li key={x}>
              <span className={styles.ruler_value}>
                {((x / props.scale) * 100).toFixed(0)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default HorizontalRuler;
