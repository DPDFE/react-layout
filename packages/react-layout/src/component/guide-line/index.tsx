import { DirectionType, GuideLineProps, RulerPointer } from '@/interfaces';
import { addEvent, formatFloatNumber, removeEvent } from '@dpdfe/event-utils';
import React, { memo, useEffect, useState } from 'react';
import Menus, { MenuItem } from '../menus';
import styles from './styles.module.css';

const GuideLine = (props: GuideLineProps) => {
    const GUIDE_OFFSET = 6,
        WORD_OFFSET = 50;

    const {
        ruler_hover_pos,
        l_offset,
        t_offset,
        canvas_viewport_ref,
        guide_lines,
        removeGuideLine
    } = props;

    const [scroll_left, setScrollLeft] = useState<number>(0);
    const [scroll_top, setScrollTop] = useState<number>(0);
    const [guide_menu_pos, setDeleteGuideMenuPos] =
        useState<{ x: number; y: number; line: RulerPointer }>();

    const viewport_pos = canvas_viewport_ref.current?.getBoundingClientRect()
        ? canvas_viewport_ref.current?.getBoundingClientRect()
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
            l_offset +
            (viewport_pos?.x ?? 0) -
            (canvas_viewport_ref.current?.scrollLeft ?? 0);

        const scroll_top =
            t_offset +
            (viewport_pos?.y ?? 0) -
            (canvas_viewport_ref.current?.scrollTop ?? 0);

        setScrollLeft(scroll_left);
        setScrollTop(scroll_top);
    };

    const clearGuideMenuPos = () => {
        setDeleteGuideMenuPos(undefined);
    };

    useEffect(() => {
        addEvent(document, 'click', clearGuideMenuPos);
        return () => {
            addEvent(document, 'click', clearGuideMenuPos);
        };
    }, []);

    useEffect(() => {
        calcGuidePose();
        addEvent(props.canvas_viewport_ref.current, 'scroll', calcGuidePose);
        return () => {
            removeEvent(
                props.canvas_viewport_ref.current,
                'scroll',
                calcGuidePose
            );
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
                        formatFloatNumber(ruler_hover_pos.x / props.scale, 2),
                        ruler_hover_pos.x,
                        {},
                        { zIndex: 1 }
                    );

                case DirectionType.vertical:
                    return VerticalLine(
                        formatFloatNumber(ruler_hover_pos.y / props.scale, 2),
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
                        formatFloatNumber(line.x, 2),
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
                                        canvas_viewport_ref.current!.scrollLeft
                                    ? 'none'
                                    : 'block'
                        }
                    );
                case DirectionType.vertical:
                    const y = line.y * props.scale;
                    return VerticalLine(
                        formatFloatNumber(line.y, 2),
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
                                        canvas_viewport_ref.current!.scrollTop
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
                <Menus
                    style={{
                        position: 'absolute',
                        left: guide_menu_pos.x,
                        top: guide_menu_pos.y
                    }}
                >
                    <MenuItem
                        onClick={(e) => {
                            e.nativeEvent.stopImmediatePropagation();
                            removeGuideLine?.(guide_menu_pos.line);
                            setDeleteGuideMenuPos(undefined);
                        }}
                    >
                        删除
                    </MenuItem>
                </Menus>
            )}
        </React.Fragment>
    );
};

GuideLine.defaultProps = {
    guide_lines: []
};

export default memo(GuideLine);
