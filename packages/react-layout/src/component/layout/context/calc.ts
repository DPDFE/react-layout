import {
    LayoutItem,
    ItemPos,
    MarginScheme,
    WidgetType,
    Pos
} from '@/interfaces';

export const RULER_GAP = 100; // 标尺间隔大小
export const TOP_RULER_LEFT_MARGIN = 15; //顶部标尺左侧间隔
export const WRAPPER_PADDING = 200; // 编辑状态下的边框

// grid 转 XY
export const gridXY = (
    grid_number: number,
    size: number,
    margin_px: number
) => {
    if (!Number.isFinite(grid_number)) return grid_number;
    return Math.round(
        size * grid_number + Math.max(0, grid_number - 1) * margin_px
    );
};

// XY 转 grid
export const calcXY = (
    grid_number: number,
    size: number,
    margin_px: number,
    padding_px: number
) => {
    return Math.round((grid_number - padding_px) / (size + margin_px));
};

// WH 转 grid
export const calcWH = (
    grid_number: number,
    size: number,
    margin_px: number
): number => {
    return Math.round((grid_number + margin_px) / (size + margin_px));
};

export function moveToWidget(target: LayoutItem, to: ItemPos) {
    target.x = to.x;
    target.y = to.y;
    target.w = to.w;
    target.h = to.h;
    target.inner_h = to.inner_h;
}

export function replaceWidget(arr: LayoutItem[], item?: LayoutItem) {
    return item
        ? arr.map((obj) => [item].find((o) => o.i === obj.i) || obj)
        : arr;
}
export function cloneWidget(w: LayoutItem) {
    return {
        ...w
    };
}

/**
 * 生成从0开始的数组
 * @param count1
 * @param count2
 * @returns
 */
export const reciprocalNum = (count1: number, count2: number) => {
    const list: any[] = [];
    for (let i = -count1; i <= count2; i++) {
        list.push(i);
    }
    return list;
};

/**
 * 获取5的整数倍数值
 * @param count
 * @param approximation
 * @returns
 */
export const fiveMultipleIntergral = (count: number, approximation = 5) => {
    const max = Math.ceil(count / approximation) * approximation;
    const min = Math.floor(count / approximation) * approximation;
    return max - count >= approximation / 2 ? min : max;
};

/**
 * 补全padding
 * @param bound
 * @returns
 */
export function completedPadding(
    bound?: [number, number?, number?, number?]
): MarginScheme {
    let pos = { top: 0, right: 0, bottom: 0, left: 0 };
    if (bound) {
        switch (bound.length) {
            case 1:
                pos = {
                    top: bound[0],
                    right: bound[0],
                    bottom: bound[0],
                    left: bound[0]
                };
                break;
            case 2:
                pos = {
                    top: bound[0],
                    right: bound[1] as number,
                    bottom: bound[0],
                    left: bound[1] as number
                };
                break;
            case 3:
                pos = {
                    top: bound[0],
                    right: bound[1] as number,
                    bottom: bound[2] as number,
                    left: bound[1] as number
                };
                break;
            case 4:
                pos = {
                    top: bound[0],
                    right: bound[1] as number,
                    bottom: bound[2] as number,
                    left: bound[3] as number
                };
                break;
        }
    }
    return pos;
}

/**
 * 取中间值
 * @param client
 * @param calc
 * @returns
 */
export function calcOffset(client: number, calc: number) {
    return client - calc > 0 ? (client - calc) / 2 : 0;
}

/**
 * 格式化输出
 * @param arr
 * @returns
 */
export function formatOutputValue(arr: LayoutItem[]) {
    return arr.map((item) => {
        delete item.is_dragging;
        delete item.moved;
        return item;
    });
}

/**
 * 获取组件实际宽高
 * 组件信息补全
 * @param item
 * @returns
 */
export function LayoutItemStandard(
    data: LayoutItem,
    parent_layout_id: string,
    toYHpx: (item: LayoutItem) => Pos
) {
    const item = { ...data } as LayoutItem;

    item.layout_id = parent_layout_id;
    item.type = item.type ?? WidgetType.drag;
    item.is_draggable = item.is_draggable ?? false;
    item.is_resizable = item.is_resizable ?? false;
    item.is_droppable = item.is_droppable ?? false;
    item.need_border_draggable_handler =
        item.need_border_draggable_handler ?? false;
    item.w = Math.max(
        item.min_w ?? (item.type === WidgetType.drag ? 5 : 1),
        item.w
    );
    item.h = Math.max(
        item.min_h ?? (item.type === WidgetType.drag ? 5 : 1),
        item.h
    );
    item.moved = false;
    item.is_dragging = false;
    item.is_resizing = false;

    const out = toYHpx(item);
    item.h = out.h;
    item.y = out.y;
    item.inner_h = out.inner_h;
    return { ...item };
}
