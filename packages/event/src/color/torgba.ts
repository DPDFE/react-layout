import { isRgb } from './base';
import { toHex } from './tohex';

export enum RGBFormatType {
    Array = 'array',
    Object = 'object',
    Css = 'css'
}

export interface RGB {
    red: number;
    green: number;
    blue: number;
}

export interface RGBA {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface RGBAOptions {
    format?: RGBFormatType;
    alpha?: number;
}

export interface RGBOptions {
    format?: RGBFormatType;
    backgroundColor?: string;
}

/**
 *
 * @param color
 * @param options
 * @description 支持转化keyword、hex多种形式统一化处理生成object、array格式
 */
export function toRgba(
    color: string,
    options: RGBAOptions = { format: RGBFormatType.Css }
) {
    // hex
    let hex = toHex(color).replace('#', ''),
        alpha = 1;

    if (hex.length === 8) {
        alpha = Number.parseInt(hex.slice(6, 8), 16) / 255;
        hex = hex.slice(0, 6);
    }

    if (hex.length === 4) {
        alpha = Number.parseInt(hex.slice(3, 4).repeat(2), 16) / 255;
        hex = hex.slice(0, 3);
    }

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const number = Number.parseInt(hex, 16);
    const red = number >> 16;
    const green = (number >> 8) & 255;
    const blue = number & 255;

    if (options.alpha) {
        if (
            typeof options.alpha === 'number' &&
            options.alpha >= 0 &&
            options.alpha <= 1
        ) {
            alpha = options.alpha;
        } else {
            throw new Error(
                `Expected alpha value (${options.alpha}) as a fraction`
            );
        }
    }

    alpha = Number(alpha.toFixed(2));

    if (options.format === RGBFormatType.Array) {
        return [red, green, blue, alpha] as [number, number, number, number];
    }

    if (options.format === RGBFormatType.Object) {
        return { red, green, blue, alpha } as RGBA;
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})` as string;
}

/**
 * 获取颜色透明度
 * @param color
 */
export function getOpacity(color: string) {
    return (toRgba(toHex(color), { format: RGBFormatType.Object }) as RGBA)
        .alpha;
}

/**
 * 合成数字颜色处理 https://keithp.com/~keithp/porterduff/p253-porter.pdf
 *
 * Alpha 合成或混合 https://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
 */
export function toRgb(
    color: string,
    options: RGBOptions = { format: RGBFormatType.Css, backgroundColor: '#fff' }
) {
    const source = toRgba(color, { format: RGBFormatType.Object }) as RGBA;

    const background = toRgba(options.backgroundColor ?? '#ffffff', {
        format: RGBFormatType.Object
    }) as RGBA;

    console.log(source, background);

    const red = (1 - source.alpha) * background.red + source.alpha * source.red;
    const green =
        (1 - source.alpha) * background.green + source.alpha * source.green;
    const blue =
        (1 - source.alpha) * background.blue + source.alpha * source.blue;

    if (options.format === RGBFormatType.Array) {
        return [red, green, blue] as [number, number, number];
    }

    if (options.format === RGBFormatType.Object) {
        return {
            red,
            green,
            blue
        } as RGB;
    }
    return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * 灰度级别
 * @param color
 * @returns
 */
export function getGrayLevel(color: string) {
    const { red, green, blue } = toRgb(color, {
        format: RGBFormatType.Object
    }) as RGB;
    return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
}
