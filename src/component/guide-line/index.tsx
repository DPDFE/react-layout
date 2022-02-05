import { DirectionType, GuideLineProps, RulerPointer } from '@/interfaces';
import { fomatFloatNumber } from '@/utils/utils';
import { addEvent, removeEvent } from '@pearone/event-utils';
import React, { memo, useEffect, useState } from 'react';
import styles from './styles.module.css';

const GuideLine = (props: GuideLineProps) => {
    const GUIDE_OFFSET = 6,
        WORD_OFFSET = 50;

    const {
        ruler_hover_pos,
        l_offset,
        t_offset,
        canvas_viewport,
        guide_lines,
        removeGuideLine
    } = props;

    const [scroll_left, setScrollLeft] = useState<number>(0);
    const [scroll_top, setScrollTop] = useState<number>(0);
    const [guide_menu_pos, setDeleteGuideMenuPos] =
        useState<{ x: number; y: number; line: RulerPointer }>();

    const viewport_pos = canvas_viewport.current?.getBoundingClientRect()
        ? canvas_viewport.current?.getBoundingClientRect()
        : ({
              height: 0,
              width: 0,
              x: 0,
              y: 0,
              bottom: 0,
              left: 0,
              right: 0,
              top: 0
          } as DOMRect);

    const calcGuidePose = () => {
        const scroll_left =
            l_offset + viewport_pos!.x - canvas_viewport.current!.scrollLeft;

        const scroll_top =
            t_offset + viewport_pos!.y - canvas_viewport.current!.scrollTop;

        setScrollLeft(scroll_left);
        setScrollTop(scroll_top);
    };

    const clearGuideMenuPos = () => {
        setDeleteGuideMenuPos(undefined);
    };

    useEffect(() => {
        addEvent(document, 'click', clearGuideMenuPos, { capture: false });
        return () => {
            addEvent(document, 'click', clearGuideMenuPos, { capture: false });
        };
    }, []);

    useEffect(() => {
        calcGuidePose();
        addEvent(props.canvas_viewport.current, 'scroll', calcGuidePose);
        return () => {
            removeEvent(props.canvas_viewport.current, 'scroll', calcGuidePose);
        };
    }, [props.l_offset, props.t_offset, props.scale, viewport_pos]);

    /** 垂直配置 */
    const VerticalLine = (
        num: number,
        scale_num: number,
        props?: Object,
        style?: Object
    ) => {
        return (
            <div
                {...props}
                className={styles.vertical_pointer}
                style={{
                    ...style,
                    height: 0,
                    width: viewport_pos!.width + GUIDE_OFFSET,
                    left: viewport_pos!.x - GUIDE_OFFSET,
                    top: scale_num + scroll_top
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
    const HorizontalLine = (
        num: number,
        scale_num: number,
        props?: Object,
        style?: Object
    ) => {
        return (
            <div
                {...props}
                className={styles.horizontal_pointer}
                style={{
                    ...style,
                    width: 0,
                    height: viewport_pos!.height + GUIDE_OFFSET,
                    left: scale_num + scroll_left,
                    top: viewport_pos!.y - GUIDE_OFFSET
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
                    return HorizontalLine(
                        fomatFloatNumber(ruler_hover_pos.x / props.scale, 2),
                        ruler_hover_pos.x,
                        {},
                        { zIndex: 1 }
                    );

                case DirectionType.vertical:
                    return VerticalLine(
                        fomatFloatNumber(ruler_hover_pos.y / props.scale, 2),
                        ruler_hover_pos.y,
                        {},
                        { zIndex: 1 }
                    );
            }
        } else {
            return <React.Fragment></React.Fragment>;
        }
    };

    /** 渲染辅助线 */
    const renderGuideLines = () => {
        return guide_lines?.map((line) => {
            switch (line.direction) {
                case DirectionType.horizontal:
                    const x = line.x * props.scale;
                    return HorizontalLine(
                        fomatFloatNumber(line.x, 2),
                        x,
                        {
                            key: `${line.direction}-${line.x}-${line.y}`,
                            onClick: (e: React.MouseEvent) => {
                                e.nativeEvent.stopImmediatePropagation();
                                setDeleteGuideMenuPos({
                                    x: e.clientX,
                                    y: e.clientY,
                                    line: line
                                });
                            }
                        },
                        {
                            borderStyle: 'solid',
                            display:
                                scroll_left + x < viewport_pos!.x ||
                                x + l_offset >
                                    viewport_pos!.width +
                                        canvas_viewport.current!.scrollLeft
                                    ? 'none'
                                    : 'block'
                        }
                    );
                case DirectionType.vertical:
                    const y = line.y * props.scale;
                    return VerticalLine(
                        fomatFloatNumber(line.y, 2),
                        y,
                        {
                            key: `${line.direction}-${line.x}-${line.y}`,
                            onClick: (e: React.MouseEvent) => {
                                e.nativeEvent.stopImmediatePropagation();
                                setDeleteGuideMenuPos({
                                    x: e.clientX,
                                    y: e.clientY,
                                    line: line
                                });
                            }
                        },
                        {
                            borderStyle: 'solid',
                            display:
                                scroll_top + y < viewport_pos!.y ||
                                y + t_offset >
                                    viewport_pos!.height +
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

            {guide_menu_pos && (
                /** 滚动时menu没有消失 */
                <div
                    className={styles.delete_menu}
                    style={{
                        left:
                            guide_menu_pos.x -
                            canvas_viewport.current!.scrollLeft,
                        top:
                            guide_menu_pos.y -
                            canvas_viewport.current!.scrollTop
                    }}
                    onClick={(e) => {
                        e.nativeEvent.stopImmediatePropagation();
                        removeGuideLine?.(guide_menu_pos.line);
                        setDeleteGuideMenuPos(undefined);
                    }}
                >
                    删除
                </div>
            )}
        </React.Fragment>
    );
};

export default memo(GuideLine);
