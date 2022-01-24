import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface VerticalRulerProps {
  width: number | string;
  scale: number;
}

const VerticalRuler = (props: VerticalRulerProps) => {
  const [y_offset, setYOffset] = useState<number[]>([]); // 尺子垂直间隔
  const [t_offset, setTopOffset] = useState<number>(0); // 垂直画布偏移量

  /**
   * 计算水平方向尺子位置
   */
  const calcHorizontalRulerPos = () => {};

  useEffect(() => {}, [props.width, props.scale]);

  return (
    <div>
      <ul
        className={styles.vertical}
        // style={{
        //   paddingTop: ruler_offset_top,
        //   marginTop: ruler_align_top
        // }}
        // onMouseMove={(e) => {
        //   e.persist();
        //   setHoverPos({
        //     x: 0,
        //     y: e.clientY - wrapper_pos.y
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
        //       x: 0,
        //       y: parseInt(
        //         ((hover_pos.y - t_offset) / props.store.scale).toFixed(0)
        //       ),
        //       direction: 'vertical'
        //     });
        //     props.store.savePageStyles();
        //   }
        // }}
      >
        {/* {y_offset.map((y) => {
        return (
          <li key={y}>
            <span className={styles.ruler_value}>
              {((y / props.store.scale) * 100).toFixed(0)}
            </span>
          </li>
        );
      })} */}
      </ul>
    </div>
  );
};

export default VerticalRuler;
