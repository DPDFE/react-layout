import { fomatFloatNumber } from '../utils';
import { clamp } from './base';
import { HSLA, toHsl } from './tohsl';
import { RGBFormatType, RGB, toRgb, getLuminance, _toRgba } from './torgba';

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
export function luminance(
    color: string,
    options: ColorLineOptions & { is_full?: boolean } = {
        percent: 5,
        is_full: true
    }
) {
    const current = toHsl(color, { format: RGBFormatType.Object });
    const max = toHsl(options.max ?? '#000000', {
        format: RGBFormatType.Object
    });
    const min = toHsl(options.min ?? '#FFFFFF', {
        format: RGBFormatType.Object
    });

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
 * https://en.wikipedia.org/wiki/Color_difference
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
    const white = toRgb('#FFFFFF', { format: RGBFormatType.Object });
    for (let c of gradient) {
        const key = colorDiff(
            _toRgba(c, {
                backgroundColor: '#ffffff',
                format: RGBFormatType.Object
            }),
            white
        );
        color_lut[key] = c;
    }

    // 获取最大颜色差
    const getMaxColorDiff = (
        color_lut: { [key: string]: string },
        total: number
    ) => {
        if (total === 0) {
            return;
        }
        const color_diff_lut = {} as { [key: number]: string[] };
        const color_sort = Object.keys(color_lut).sort();

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

        // 中间值
        const color = luminance(color_lut[min], {
            percent: 50,
            is_full: true,
            max: color_lut[max],
            min: color_lut[min]
        });

        const key = colorDiff(
            _toRgba(color, {
                backgroundColor: '#ffffff',
                format: RGBFormatType.Object
            }),
            white
        );
        color_lut[key] = _toRgba(color);
        getMaxColorDiff(color_lut, total - 1);
    };

    if (gradient.length >= options.total) {
        return gradient;
    } else {
        const distance = options.total - gradient.length;
        getMaxColorDiff(color_lut, distance);
        return Object.keys(color_lut)
            .sort()
            .map((c) => {
                return color_lut[c as unknown as number];
            });
    }
}

/**
 * 计算两个颜色的差值
 * https://www.compuphase.com/cmetric.htm
 */
export function colorDiff($1: RGB, $0: RGB) {
    const { red: r1, green: g1, blue: b1 } = $1,
        { red: r2, green: g2, blue: b2 } = $0,
        drp2 = Math.pow(r1 - r2, 2),
        dgp2 = Math.pow(g1 - g2, 2),
        dbp2 = Math.pow(b1 - b2, 2),
        t = (r1 + r2) / 2;

    return Math.sqrt(
        2 * drp2 + 4 * dgp2 + 3 * dbp2 + (t * (drp2 - dbp2)) / 256
    );
}

/**
 * lab计算色差
 * @param lab_a
 * @param lab_b
 * @returns
 */
export function colorDiffDeltaE(lab_a: number[], lab_b: number[]) {
    var deltaL = lab_a[0] - lab_b[0];
    var deltaA = lab_a[1] - lab_b[1];
    var deltaB = lab_a[2] - lab_b[2];
    var c1 = Math.sqrt(lab_a[1] * lab_a[1] + lab_a[2] * lab_a[2]);
    var c2 = Math.sqrt(lab_b[1] * lab_b[1] + lab_b[2] * lab_b[2]);
    var deltaC = c1 - c2;
    var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    var sc = 1.0 + 0.045 * c1;
    var sh = 1.0 + 0.015 * c1;
    var l = deltaL / 1.0;
    var c = deltaC / sc;
    var h = deltaH / sh;
    var i = l * l + c * c + h * h;
    return i < 0 ? 0 : Math.sqrt(i);
}
