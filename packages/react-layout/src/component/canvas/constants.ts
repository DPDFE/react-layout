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
        const padding_t = parseInt(style['padding-top']);
        const padding_l = parseInt(style['padding-left']);
        const padding_r = parseInt(style['padding-right']);
        const padding_b = parseInt(style['padding-bottom']);

        min_x = Math.max(min_x, padding_l + padding_r);
        min_y = Math.max(min_y, padding_t + padding_b);
    }
    return { min_x, min_y };
};
