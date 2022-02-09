import {
    DragLayoutProps,
    LayoutType,
    ReactDragLayoutProps
} from '@/interfaces';
import { ReactElement, RefObject } from 'react';

export const RULER_GAP = 100; // 标尺间隔大小
export const TOP_RULER_LEFT_MARGIN = 15; //顶部标尺左侧间隔
export const WRAPPER_PADDING = 200; // 编辑状态下的边框

// 生成从0开始的数组
export const reciprocalNum = (count1: number, count2: number) => {
    const list: any[] = [];
    for (let i = -count1; i <= count2; i++) {
        list.push(i);
    }
    return list;
};

// 获取5的整数倍数值
export const fiveMultipleIntergral = (count: number, approximation = 5) => {
    const max = Math.ceil(count / approximation) * approximation;
    const min = Math.floor(count / approximation) * approximation;
    return max - count >= approximation / 2 ? min : max;
};

export const calcCurrentWH = (
    container_ref: RefObject<HTMLDivElement>,
    props: ReactDragLayoutProps
): {
    current_width: number;
    current_height: number;
} => {
    const { width, height, mode } = props as DragLayoutProps;

    const offset_width = mode === LayoutType.edit ? TOP_RULER_LEFT_MARGIN : 0;

    const current_width = width
        ? width
        : container_ref.current?.clientWidth
        ? container_ref.current?.clientWidth - offset_width
        : 0;
    const current_height = height
        ? height
        : container_ref.current?.clientHeight
        ? container_ref.current?.clientHeight - offset_width
        : 0;

    return { current_width, current_height };
};

// 根据画布大小、元素大小、视窗大小，综合计算出画板宽高
// 画布位于视窗中间，元素需要全部显示

// 画布定位计算逻辑：
// 编辑状态下：
// 画板大小 = Math.max(视窗大小，画布 + padding，元素最大宽高 + 2 * 画布偏移量)
// 非编辑状态下：
// 无论元素是否全在画布内，都只显示画布内容，画板大小 = Math.max(视窗大小，画布）。

// 居中逻辑：
// 编辑状态，画布增加padding，非编辑状态，不增加
// 画布相对视窗居中
export const getMaxWidgetsRange = (
    canvas_viewport: RefObject<HTMLDivElement>,
    container_ref: RefObject<HTMLDivElement>,
    props: ReactDragLayoutProps
) => {
    const { mode, scale, children } = props;

    const { current_width, current_height } = calcCurrentWH(
        container_ref,
        props
    );

    const { max_left, max_right, max_top, max_bottom } = maxBorderPos(
        current_width,
        current_height,
        children
    );

    // 视窗的宽、高度
    const client_height = canvas_viewport.current?.clientHeight
        ? canvas_viewport.current?.clientHeight
        : 0;
    const client_width = canvas_viewport.current?.clientWidth
        ? canvas_viewport.current?.clientWidth
        : 0;

    // 如果没有宽高就是自适应模式
    if (
        (props as DragLayoutProps).width === undefined ||
        (props as DragLayoutProps).height === undefined
    ) {
        return {
            wrapper_calc_width: current_width,
            wrapper_calc_height: max_bottom,
            t_offset: 0,
            l_offset: 0,
            current_width: current_width,
            current_height: max_bottom,
            t_scroll: 0,
            l_scroll: 0
        };
    }

    const calc_width = current_width * scale;
    const calc_height = current_height * scale;

    // 计算水平、垂直偏移量
    if (mode === LayoutType.edit) {
        const ele_width = max_right * scale - max_left * scale;
        const ele_height = max_bottom * scale - max_top * scale;

        const l_offset =
            calcOffset(client_width, calc_width + WRAPPER_PADDING) +
            WRAPPER_PADDING / 2;
        const t_offset =
            calcOffset(client_height, calc_height + WRAPPER_PADDING) +
            WRAPPER_PADDING / 2;

        const wrapper_calc_width = Math.max(
            calc_width > ele_width
                ? calc_width + WRAPPER_PADDING
                : ele_width + 2 * l_offset,
            client_width
        );
        const wrapper_calc_height = Math.max(
            calc_height > ele_height
                ? calc_height + WRAPPER_PADDING
                : ele_height + 2 * t_offset,
            client_height
        );

        return {
            wrapper_calc_width,
            wrapper_calc_height,
            t_offset: t_offset + Math.abs(max_top) * scale,
            l_offset: l_offset + Math.abs(max_left) * scale,
            current_height,
            current_width,
            t_scroll: Math.abs(max_top) * scale,
            l_scroll: Math.abs(max_left) * scale
        };
    } else {
        const l_offset = calcOffset(client_width, calc_width);
        const t_offset = calcOffset(client_height, calc_height);

        return {
            wrapper_calc_width: Math.max(calc_width, client_width),
            wrapper_calc_height: Math.max(calc_height, client_height),
            current_height,
            current_width,
            l_offset,
            t_offset,
            t_scroll: 0,
            l_scroll: 0
        };
    }
};

function calcOffset(client: number, calc: number) {
    return client - calc > 0 ? (client - calc) / 2 : 0;
}

function maxBorderPos(
    default_width: number,
    default_height: number,
    children: ReactElement[]
) {
    // 元素计算大小
    let max_left = 0,
        max_right = default_width,
        max_top = 0,
        max_bottom = default_height;

    if (children) {
        children.map((child) => {
            const { x, y, h, w } = child.props['data-drag'];
            if (x) {
                max_left = max_left < x ? max_left : x; // 最左边最小值
                max_right = max_right < x + w ? x + w : max_right; // 最大值
                max_top = max_top < y ? max_top : y; // 最上边最小值
                max_bottom = max_bottom < y + h ? y + h : max_bottom; // 最大值
            }
        });
    }
    return { max_left, max_right, max_top, max_bottom };
}
