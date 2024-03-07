import { toHsl } from './tohsl';
import { clamp, sortColors } from './base';
import { formatFloatNumber } from '../data/format';
import { RGBFormatType, RGB, toRgb, toRgbaByCanvas } from './torgba';

export interface ColorLineOptions {
    percent: number;
    max?: string; // 最大的颜色
    min?: string; // 最小的颜色
}

export enum ColorUseType {
    Rgb = 'RGB',
    Hsl = 'HSL'
}

export type ColorUseProps =
    | {
          use?: ColorUseType.Hsl;
          is_full?: boolean; // 全局颜色渐变
      }
    | {
          use?: ColorUseType.Rgb;
      };

/**
 * 加深
 * less 支持darken函数方法但非线性渐变
 * @param color
 * @param percent
 */
export function darken(
    color: string,
    options: ColorLineOptions & ColorUseProps = {
        percent: 5,
        use: ColorUseType.Rgb
    }
) {
    if (options.use && options.use === ColorUseType.Hsl) {
        return changeBrightnessByHSL(color, { ...options });
    } else {
        return changeBrightnessByRGB(color, { ...options });
    }
}

/**
 * 提亮
 * less支持lighten函数方法但非线性渐变
 * @param color
 */
export function lighten(
    color: string,
    options: ColorLineOptions & ColorUseProps = {
        percent: 5,
        use: ColorUseType.Rgb
    }
) {
    if (options.use && options.use === ColorUseType.Hsl) {
        return changeBrightnessByHSL(color, {
            ...options,
            percent: -options.percent
        });
    } else {
        return changeBrightnessByRGB(color, {
            ...options,
            percent: -options.percent
        });
    }
}

/**
 * rgb修改颜色亮度
 * @param color
 * @param options
 */
function changeBrightnessByRGB(
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
 * hsl修改颜色亮度，线性渐变效果
 * @param color
 * @param options
 * @returns
 */
function changeBrightnessByHSL(
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

    return `hsla(${formatFloatNumber(hue * 360, 2)}, ${formatFloatNumber(
        saturation * 100,
        2
    )}%, ${formatFloatNumber(lightness * 100, 2)}%, ${alpha})`;
}

/**
 * 颜色范围
 * @param gradient
 */
export function range(
    gradient: string[],
    options: { total: number; use?: ColorUseType } = {
        total: 2,
        use: ColorUseType.Rgb
    }
) {
    if (options.use && options.use === ColorUseType.Hsl) {
        return rangeHSL(gradient, options);
    }
    return rangeRGB(gradient, options);
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
function rangeRGB(
    gradient: string[],
    options: { total: number } = { total: 2 }
) {
    // 获取最大颜色差
    const getMaxColorDiff = (gradient: string[], total: number) => {
        if (total === 0) {
            return;
        }

        const color_diff_lut = {} as { [key: number]: string[] };
        const color_lut = {} as { [key: number]: string };

        sortColors(gradient).map((c) => {
            color_lut[c.weight] = c.color;
            return c.color;
        });

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
        const color = changeBrightnessByRGB(color_lut[min], {
            percent: 50,
            max: color_lut[max],
            min: color_lut[min]
        });

        gradient.push(color);

        getMaxColorDiff(gradient, total - 1);
    };

    if (gradient.length >= options.total) {
        return gradient;
    } else {
        const distance = options.total - gradient.length;
        getMaxColorDiff(gradient, distance);
        return sortColors(gradient).map((c) => {
            return c.color;
        });
    }
}

function rangeHSL(
    gradient: string[],
    options: { total: number } = { total: 2 }
) {
    // 获取最大颜色差
    const getMaxColorDiff = (gradient: string[], total: number) => {
        if (total === 0) {
            return;
        }

        const color_diff_lut = {} as { [key: number]: string[] };
        const color_lut = {} as { [key: number]: string };

        gradient
            .map((color) => {
                const { hue } = toHsl(color, {
                    format: RGBFormatType.Object
                });

                return {
                    weight: hue,
                    color
                };
            })
            .sort((a, b) => {
                return a.weight > b.weight ? 1 : -1;
            })
            .map((c) => {
                color_lut[c.weight] = c.color;
                return c.color;
            });

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
        const color = toRgbaByCanvas(
            changeBrightnessByHSL(color_lut[min], {
                percent: 50,
                is_full: true,
                max: color_lut[max],
                min: color_lut[min]
            }),
            {
                backgroundColor: '#ffffff',
                format: RGBFormatType.Css
            }
        );
        gradient.push(color);
        getMaxColorDiff(gradient, total - 1);
    };

    if (gradient.length >= options.total) {
        return gradient;
    } else {
        const distance = options.total - gradient.length;
        getMaxColorDiff(gradient, distance);
        return gradient
            .map((color) => {
                const { hue } = toHsl(color, {
                    format: RGBFormatType.Object
                });

                return {
                    weight: hue,
                    color
                };
            })
            .sort((a, b) => {
                return a.weight > b.weight ? 1 : -1;
            })
            .map((c) => {
                return c.color;
            });
    }
}
