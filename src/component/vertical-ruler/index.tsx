import { DirectionType, VerticalRulerProps } from '@/interfaces';
import { fiveMultipleIntergral, reciprocalNum, RULER_GAP } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { addEvent, removeEvent } from '@pearone/event-utils';

const VerticalRuler = (props: VerticalRulerProps) => {
    const [y_offset, setYOffset] = useState<number[]>([]); // 尺子垂直间隔
    const [ruler_offset_top, setRulerOffsetTop] = useState<number>(0); // 尺子位移
    const [ruler_align_top, setRulerAlignTop] = useState<number>(0); // 尺子校准偏移量

    const {
        wrapper_height,
        canvas_viewport,
        t_offset,
        setRulerHoverPos,
        addGuideLine
    } = props;

    const viewport_pos = canvas_viewport.current?.getBoundingClientRect();
    /**
     * 计算垂直方向尺子位置
     */
    const calcVerticalRulerPos = () => {
        // 画布左上角偏移量（需要为5刻度的倍数）https://www.jianshu.com/p/a89732aa84af
        const canvas_offset_top = t_offset - canvas_viewport.current!.scrollTop;

        // 尺子0点偏移整数粒度计算
        const ruler_forward_y = Math.ceil(wrapper_height / RULER_GAP);
        const ruler_backward_y = Math.floor(canvas_offset_top / RULER_GAP);

        // 尺子非整数粒度计算（需要为5刻度的倍数）
        /* 因为标尺的0点和画布的0点为不同坐标，在计算完成后会出现标尺和画布0点坐标偏差的情况，
         通过margin更新整个尺子的位置，抵消掉为了映射刻度5，多带来的padding偏移量。*/
        const ruler_offset_top =
            canvas_offset_top - ruler_backward_y * RULER_GAP;

        const ruler_offset_correct_top =
            fiveMultipleIntergral(ruler_offset_top);
        const ruler_align_top = ruler_offset_top - ruler_offset_correct_top;

        setRulerOffsetTop(ruler_offset_correct_top);
        setRulerAlignTop(ruler_align_top);

        setYOffset(reciprocalNum(ruler_backward_y, ruler_forward_y));
    };

    useEffect(() => {
        calcVerticalRulerPos();
        addEvent(props.canvas_viewport.current, 'scroll', calcVerticalRulerPos);
        return () => {
            removeEvent(
                props.canvas_viewport.current,
                'scroll',
                calcVerticalRulerPos
            );
        };
    }, [props.wrapper_height, props.height, props.scale]);

    return (
        <div>
            <ul
                className={styles.vertical}
                style={{
                    paddingTop: ruler_offset_top,
                    marginTop: ruler_align_top
                }}
                onMouseMove={(e) => {
                    setRulerHoverPos({
                        x: 0,
                        y:
                            e.clientY -
                            t_offset +
                            canvas_viewport.current!.scrollTop -
                            Math.floor(viewport_pos!.y),
                        direction: DirectionType.vertical
                    });
                }}
                onMouseOut={() => {
                    setRulerHoverPos(undefined);
                }}
                onMouseDown={(e) => {
                    addGuideLine?.({
                        x: 0,
                        y:
                            e.clientY -
                            t_offset +
                            canvas_viewport.current!.scrollTop -
                            Math.floor(viewport_pos!.y),
                        direction: DirectionType.vertical
                    });
                }}
            >
                {y_offset.map((y) => {
                    return (
                        <li key={y}>
                            <span className={styles.ruler_value}>
                                {((y / props.scale) * 100).toFixed(0)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default VerticalRuler;
