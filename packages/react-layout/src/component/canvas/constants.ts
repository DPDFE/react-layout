/**
 * 获取drag状态下的最小边界
 * @param ref
 * @param min_x
 * @param min_y
 * @returns
 */
export const getDragMinBound = (
    ref: React.RefObject<HTMLDivElement>,
    min_x: number,
    min_y: number
) => {
    const style = ref.current?.style;
    if (style) {
        const padding_t = Number.isNaN(parseInt(style['padding-top']))
            ? 0
            : parseInt(style['padding-top']);

        const padding_l = Number.isNaN(parseInt(style['padding-left']))
            ? 0
            : parseInt(style['padding-left']);

        const padding_r = Number.isNaN(parseInt(style['padding-right']))
            ? 0
            : parseInt(style['padding-right']);

        const padding_b = Number.isNaN(parseInt(style['padding-bottom']))
            ? 0
            : parseInt(style['padding-bottom']);

        min_x = Math.max(min_x, padding_l + padding_r);
        min_y = Math.max(min_y, padding_t + padding_b);
    }
    return { min_x, min_y };
};
