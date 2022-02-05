import { DirectionType, HorizontalRulerProps } from '@/interfaces';
import {
    fiveMultipleIntergral,
    reciprocalNum,
    RULER_GAP,
    TOP_RULER_LEFT_MARGIN
} from '@/utils/utils';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';
import { addEvent, removeEvent } from '@pearone/event-utils';

const HorizontalRuler = (props: HorizontalRulerProps) => {
    const [x_offset, setXOffset] = useState<number[]>([]); // 尺子水平间隔
    const [ruler_offset_left, setRulerOffsetLeft] = useState<number>(0); // 尺子位移
    const [ruler_align_left, setRulerAlignLeft] = useState<number>(0); // 尺子校准偏移量

    const {
        wrapper_width,
        canvas_viewport,
        l_offset,
        setRulerHoverPos,
        addGuideLine
    } = props;

    const viewport_pos = canvas_viewport.current?.getBoundingClientRect();

    /**
     * 计算水平方向尺子位置
     */
    const calcHorizontalRulerPos = () => {
        // 画布左上角偏移量（需要为5刻度的倍数）https://www.jianshu.com/p/a89732aa84af
        const canvas_offset_left =
            l_offset - canvas_viewport.current!.scrollLeft;

        // 尺子0点偏移整数粒度计算
        const ruler_forward_x = Math.ceil(wrapper_width / RULER_GAP);
        const ruler_backward_x = Math.floor(canvas_offset_left / RULER_GAP);

        // 尺子非整数粒度计算（需要为5刻度的倍数）
        /* 因为标尺的0点和画布的0点为不同坐标，在计算完成后会出现标尺和画布0点坐标偏差的情况，
       通过margin更新整个尺子的位置，抵消掉为了映射刻度5，多带来的padding偏移量。*/
        const ruler_offset_left =
            canvas_offset_left - ruler_backward_x * RULER_GAP;

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
        addEvent(
            props.canvas_viewport.current,
            'scroll',
            calcHorizontalRulerPos
        );
        return () => {
            removeEvent(
                props.canvas_viewport.current,
                'scroll',
                calcHorizontalRulerPos
            );
        };
    }, [props.width, props.scale, props.wrapper_width, props.l_offset]);

    return (
        <div>
            <ul
                className={styles.horizontal}
                style={{
                    paddingLeft: ruler_offset_left,
                    marginLeft: TOP_RULER_LEFT_MARGIN + ruler_align_left
                }}
                onMouseMove={(e) => {
                    setRulerHoverPos({
                        x:
                            e.clientX -
                            l_offset +
                            canvas_viewport.current!.scrollLeft -
                            Math.floor(viewport_pos!.x),
                        y: 0,
                        direction: DirectionType.horizontal
                    });
                }}
                onMouseLeave={() => {
                    setRulerHoverPos(undefined);
                }}
                onMouseDown={(e) => {
                    addGuideLine?.({
                        x:
                            (e.clientX -
                                l_offset +
                                canvas_viewport.current!.scrollLeft -
                                Math.floor(viewport_pos!.x)) /
                            props.scale,
                        y: 0,
                        direction: DirectionType.horizontal
                    });
                }}
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
