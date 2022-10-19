import { fomatFloatNumber } from '../utils';
import { clamp } from './base';
import { HSLA, toHsl } from './tohsl';
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
export function brightness(
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

    const red =
        current.red +
        ((target.red - current.red) / 100) * Math.abs(options.percent);

    const blue =
        current.blue +
        ((target.blue - current.blue) / 100) * Math.abs(options.percent);

    const green =
        current.green +
        ((target.green - current.green) / 100) * Math.abs(options.percent);

    return `rgb(${clamp(red)}, ${clamp(green)}, ${clamp(blue)})`;
}

/**
 * hsl修改颜色亮度
 * @param color
 * @param options
 * @returns
 */
export function isBrightness(
    color: string,
    options: ColorLineOptions & { is_full?: boolean } = {
        percent: 5,
        is_full: true
    }
) {
    const current = toHsl(color, { format: RGBFormatType.Object }) as HSLA;
    const max = toHsl(options.max ?? '#000000', {
        format: RGBFormatType.Object
    }) as HSLA;
    const min = toHsl(options.min ?? '#FFFFFF', {
        format: RGBFormatType.Object
    }) as HSLA;

    const target = options.percent > 0 ? max : min;

    const hue = options.is_full
        ? current.hue +
          ((target.hue - current.hue) / 100) * Math.abs(options.percent)
        : current.hue;

    const saturation = options.is_full
        ? current.saturation +
          ((target.saturation - current.saturation) / 100) *
              Math.abs(options.percent)
        : current.saturation;

    const lightness =
        current.lightness +
        ((target.lightness - current.lightness) / 100) *
            Math.abs(options.percent);

    const alpha =
        current.alpha +
        ((target.alpha - current.alpha) / 100) * Math.abs(options.percent);

    return `hsla(${fomatFloatNumber(hue * 360, 2)}, ${fomatFloatNumber(
        saturation * 100,
        2
    )}%, ${fomatFloatNumber(lightness * 100, 2)}%, ${alpha})`;
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
