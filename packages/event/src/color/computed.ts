import { fomatFloatNumber } from '../utils';
import { clamp } from './base';
import { HSLA, toHsl } from './tohsl';
import { RGBFormatType, RGB, toRgb, getLuminance } from './torgba';

export interface ColorLineOptions {
    percent: number;
    max?: string; // 最大的颜色
    min?: string; // 最小的颜色
}

/**
 * 加深
 * less 支持darken函数方法但非线性渐变
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
 * less支持lighten函数方法但非线性渐变
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
 * rgb修改颜色亮度
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
 * 推荐色
 * https://www.yuelili.com/color-how-to-generate-a-nice-gradient/
 * @param min 最小颜色
 * @param max 最大颜色
 * @param total 总数量
 * @returns
 */
export function range(
    gradient: string[],
    options: { total: number } = { total: 2 }
) {
    const color_lut = {} as { [key: number]: string };
    for (let c of gradient) {
        const key = getLuminance(
            toRgb(c, { format: RGBFormatType.Object }) as RGB
        );
        color_lut[key] = c;
    }

    const color_sort = Object.keys(color_lut).sort();

    // 获取最大颜色差
    const getMaxColorDiff = (
        color_lut: { [key: number]: string },
        total: number
    ) => {
        if (total === 0) {
            return;
        }
        const color_diff_lut = {} as { [key: number]: string[] };
        let i = 0;
        while (i < color_sort.length - 1) {
            const index =
                parseFloat(color_sort[i + 1]) - parseFloat(color_sort[i]);
            color_diff_lut[index] = [color_sort[i + 1], color_sort[i]];
            i++;
        }

        const [min, max] = color_diff_lut[
            Math.max(
                ...(Object.keys(color_diff_lut).map((c) => {
                    return parseFloat(c);
                }) as number[])
            )
        ] as unknown as [number, number];

        const color = brightness(color_lut[min], {
            percent: 50,
            max: color_lut[max],
            min: color_lut[min]
        });

        console.log(color);

        // const key = getLuminance(
        //     toRgb(color, { format: RGBFormatType.Object }) as RGB
        // );
        // console.log(key);
        // color_lut[key] = color;

        getMaxColorDiff(color_lut, total - 1);
    };

    if (gradient.length >= options.total) {
        return gradient;
    } else {
        const distance = options.total - gradient.length;
        getMaxColorDiff(color_lut, distance);
    }
    return gradient;
}

/**
 * 计算两个颜色的差值
 * https://www.compuphase.com/cmetric.htm
 */
export function colorDiff($1: RGB, $0: RGB) {
    return Math.sqrt(
        Math.pow($1.red - $0.red, 2) +
            Math.pow($1.green - $0.green, 2) +
            Math.pow($1.blue - $0.blue, 2)
    );
}
