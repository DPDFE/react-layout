import React, { useEffect, useState } from 'react';
import styles from './styles.css';

interface HorizontalRulerProps {
  height: number | string;
  scale: number;
}

const HorizontalRuler = (props: HorizontalRulerProps) => {
  const [x_offset, setXOffset] = useState<number[]>([]); // 尺子水平间隔
  const [l_offset, setLeftOffset] = useState<number>(0); // 水平画布偏移量

  /**
   * 计算水平方向尺子位置
   */
  const calcHorizontalRulerPos = () => {};

  useEffect(() => {}, [props.height, props.scale]);

  return (
    <div>
      <ul
        className={styles.horizontal}
        // style={{
        //   paddingLeft: ruler_offset_left,
        //   marginLeft: 15 + ruler_align_left
        // }}
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
        {/* {x_offset.map((x) => {
          return (
            <li key={x}>
              <span className={styles.ruler_value}>
                {((x / props.scale) * 100).toFixed(0)}
              </span>
            </li>
          );
        })} */}
      </ul>
    </div>
  );
};

export default HorizontalRuler;
