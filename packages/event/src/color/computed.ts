import { RGBFormatType, toRgb, RGB, toRgba } from './torgba';

export interface ColorLineOptions {
    percent: number;
    max?: string; // 最大的颜色
    min?: string; // 最小的颜色
}

export enum Direction {
    Upper = 'upper',
    Lower = 'lower'
}

/**
 * 加深
 * @param color
 * @param percent
 */
export function darken(
    color: string,
    options: ColorLineOptions = {
        percent: 5
    }
) {
    return brightness(color, { ...options, direction: Direction.Lower });
}

/**
 * 提亮
 * @param color
 */
export function lighten(
    color: string,
    options: ColorLineOptions = {
        percent: 5
    }
) {
    return brightness(color, { ...options, direction: Direction.Upper });
}

/**
 * 修改颜色亮度
 * @param color
 * @param options
 */
function brightness(
    color: string,
    options: ColorLineOptions & { direction: Direction } = {
        percent: 5,
        direction: Direction.Upper
    }
) {
    const current = toRgba(color, { format: RGBFormatType.Object }) as RGB;
    const max = toRgba(options.max ?? '#000000', {
        format: RGBFormatType.Object
    }) as RGB;
    const min = toRgba(options.min ?? '#FFFFFF', {
        format: RGBFormatType.Object
    }) as RGB;

    const direction = options.direction === Direction.Upper ? -1 : 1;

    const clamp = (data: number, min: number = 0, max: number = 255) => {
        return Math.min(Math.max(data, min), max);
    };

    const red = Math.round(
        current.red + ((max.red - min.red) / 100) * options.percent * direction
    );
    const blue = Math.round(
        current.blue +
            ((max.blue - min.blue) / 100) * options.percent * direction
    );
    const green = Math.round(
        current.green +
            ((max.green - min.green) / 100) * options.percent * direction
    );

    return `rgb(${clamp(red)}, ${clamp(green)}, ${clamp(blue)})`;
}

export function rgbaToHsla([R, G, B, A]: number[]) {
    R /= 255;
    G /= 255;
    B /= 255;
    const max = Math.max(R, G, B);
    const min = Math.min(R, G, B);
    const range = max - min;
    let V = max;
    let S = V === 0 ? 0 : range / V;
    let H = 0;
    if (R === V) H = (60 * (G - B)) / range;
    if (G === V) H = 120 + (60 * (B - R)) / range;
    if (B === V) H = 240 + (60 * (R - G)) / range;

    if (range === 0) H = 0;
    if (H < 0) H += 360;
    H = (H / 2) * (256 / 180);
    S *= 255;
    V *= 255;
    return [H, S, V, A];
}

//TODO: 增加反色、增加区间增加颜色百分比、调节亮度

// white \ black
