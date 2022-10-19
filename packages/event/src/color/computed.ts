import { clamp } from './base';
import { RGBFormatType, RGB, toRgb } from './torgba';

export interface ColorLineOptions {
    percent: number;
    max?: string; // 最大的颜色
    min?: string; // 最小的颜色
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
    return brightness(color, { ...options });
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
    return brightness(color, { ...options, percent: -options.percent });
}

/**
 * 修改颜色亮度
 * @param color
 * @param options
 */
function brightness(
    color: string,
    options: ColorLineOptions = {
        percent: 5
    }
) {
    const current = toRgb(color, { format: RGBFormatType.Object }) as RGB;
    const max = toRgb(options.max ?? '#000000', {
        format: RGBFormatType.Object
    }) as RGB;
    const min = toRgb(options.min ?? '#FFFFFF', {
        format: RGBFormatType.Object
    }) as RGB;

    const target = options.percent > 0 ? max : min;

    const red = Math.round(
        current.red +
            ((target.red - current.red) / 100) * Math.abs(options.percent)
    );
    const blue = Math.round(
        current.blue +
            ((target.blue - current.blue) / 100) * Math.abs(options.percent)
    );
    const green = Math.round(
        current.green +
            ((target.green - current.green) / 100) * Math.abs(options.percent)
    );

    return `rgb(${clamp(red)}, ${clamp(green)}, ${clamp(blue)})`;
}

/**
 * 颜色区间
 * https://www.yuelili.com/color-how-to-generate-a-nice-gradient/
 * @param min 最小颜色
 * @param max 最大颜色
 * @param total 总数量
 * @returns
 */
export function range(gradient: string[], total: number = 2) {
    if (gradient.length <= total) {
        return gradient;
    }
    return gradient;
}
