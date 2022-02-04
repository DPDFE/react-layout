import { DirectionType, GuideLineProps } from '@/interfaces';
import { TOP_RULER_LEFT_MARGIN } from '@/utils/utils';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const GuideLine = (props: GuideLineProps) => {
    const GUIDE_OFFSET = 6,
        WORD_OFFSET = 50;

    const {
        ruler_hover_pos,
        l_offset,
        t_offset,
        canvas_viewport,
        guide_lines
    } = props;

    const viewport_pos = canvas_viewport.current
        ? canvas_viewport.current.getBoundingClientRect()
        : { height: 0, width: 0, x: 0, y: 0 };

    console.log(canvas_viewport);

    const [scroll_left, setScrollLeft] = useState<number>(0);
    const [scroll_top, setScrollTop] = useState<number>(0);

    const calcGuidePose = () => {
        console.log(
            l_offset,
            viewport_pos.x,
            canvas_viewport.current!.scrollLeft,
            TOP_RULER_LEFT_MARGIN
        );
        const scroll_left =
            l_offset + viewport_pos.x - canvas_viewport.current!.scrollLeft;

        const scroll_top =
            t_offset +
            viewport_pos.y -
            canvas_viewport.current!.scrollTop +
            TOP_RULER_LEFT_MARGIN;

        setScrollLeft(scroll_left);
        setScrollTop(scroll_top);
    };

    useEffect(() => {
        calcGuidePose();
        addEvent(props.canvas_viewport.current, 'scroll', calcGuidePose);
        return () => {
            removeEvent(props.canvas_viewport.current, 'scroll', calcGuidePose);
        };
    }, [props.l_offset, props.t_offset, props.scale]);

    /** 垂直配置 */
    const VerticalLine = (num: number, props?: Object, style?: Object) => {
        return (
            <div
                {...props}
                className={styles.vertical_pointer}
                style={{
                    ...style,
                    height: 0,
                    width: viewport_pos.width + GUIDE_OFFSET,
                    left: viewport_pos.x - GUIDE_OFFSET,
                    top: num + scroll_top
                }}
            >
                <span
                    style={{
                        left: WORD_OFFSET
                    }}
                    className={styles.word}
                >
                    y:{num}
                </span>
            </div>
        );
    };

    /** 水平配置 */
    const HorizontalLine = (num: number, props?: Object, style?: Object) => {
        console.log(num, scroll_left);
        return (
            <div
                {...props}
                className={styles.horizontal_pointer}
                style={{
                    ...style,
                    width: 0,
                    height: viewport_pos.height + GUIDE_OFFSET,
                    left: num + scroll_left,
                    top: viewport_pos.y - GUIDE_OFFSET
                }}
            >
                <span
                    className={styles.word}
                    style={{
                        top: WORD_OFFSET
                    }}
                >
                    x:{num}
                </span>
            </div>
        );
    };

    /** 动态辅助线 */
    const renderDynamicGuideLine = () => {
        if (ruler_hover_pos) {
            switch (ruler_hover_pos.direction) {
                case DirectionType.horizontal:
                    return HorizontalLine(ruler_hover_pos.x);

                case DirectionType.vertical:
                    return VerticalLine(ruler_hover_pos.y);
            }
        } else {
            return <React.Fragment></React.Fragment>;
        }
    };

    /** 渲染辅助线 */
    const renderGuideLines = () => {
        return guide_lines?.map((line) => {
            const x = line.x * props.scale;

            switch (line.direction) {
                case DirectionType.horizontal:
                    return HorizontalLine(
                        x,
                        { key: `${line.direction}-${line.x}-${line.y}` },
                        {
                            borderStyle: 'solid',
                            display:
                                scroll_left + x < viewport_pos.x ||
                                x + l_offset >
                                    viewport_pos.width +
                                        canvas_viewport.current!.scrollLeft
                                    ? 'none'
                                    : 'block'
                        }
                    );
                case DirectionType.vertical:
                    return VerticalLine(
                        line.y,
                        { key: `${line.direction}-${line.x}-${line.y}` },
                        {
                            borderStyle: 'solid',
                            display:
                                scroll_top + line.y < viewport_pos.y ||
                                line.y + t_offset >
                                    viewport_pos.height +
                                        canvas_viewport.current!.scrollTop
                                    ? 'none'
                                    : 'block'
                        }
                    );
            }
        });
    };

    return (
        <React.Fragment>
            {renderDynamicGuideLine()}
            {renderGuideLines()}
        </React.Fragment>
    );
};

export default GuideLine;
