import { formatFloatNumber } from '../data/format';
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

// 重载方法定义
export function toRgba(
    color: string,
    options?: { format?: RGBFormatType.Css; alpha?: number }
): string;
export function toRgba(
    color: string,
    options?: { format: RGBFormatType.Object; alpha?: number }
): RGBA;
export function toRgba(
    color: string,
    options?: { format: RGBFormatType.Array; alpha?: number }
): [number, number, number, number];

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

// 重载方法定义
export function toRgb(
    color: string,
    options?: { format?: RGBFormatType.Css; backgroundColor?: string }
): string;
export function toRgb(
    color: string,
    options: { format: RGBFormatType.Object; backgroundColor?: string }
): RGB;
export function toRgb(
    color: string,
    options: { format: RGBFormatType.Array; backgroundColor?: string }
): [number, number, number];

//优化点：颜色上有差异
/**
 * 合成数字颜色处理 https://keithp.com/~keithp/porterduff/p253-porter.pdf
 * Alpha 合成或混合 https://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending
 * rgba to rgb http://marcodiiga.github.io/rgba-to-rgb-conversion
 */
export function toRgb(
    color: string,
    options: RGBOptions = {
        format: RGBFormatType.Css,
        backgroundColor: 'rgb(255,255,255)'
    }
) {
    const source = toRgba(color, { format: RGBFormatType.Object });

    const background = toRgba(
        options.backgroundColor
            ? isRgb(options.backgroundColor)
                ? options.backgroundColor
                : (toRgb(options.backgroundColor) as string)
            : 'rgb(255,255,255)',
        {
            format: RGBFormatType.Object
        }
    );

    const { red, green, blue } = colorMerge(source, background);

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

export function toRgbaByCanvas(
    source: string,
    options?: { format?: RGBFormatType.Css; backgroundColor?: string }
): string;

export function toRgbaByCanvas(
    source: string,
    options: { format: RGBFormatType.Object; backgroundColor?: string }
): RGBA;

export function toRgbaByCanvas(
    source: string,
    options: { format: RGBFormatType.Array; backgroundColor?: string }
): [number, number, number, number];

/**
 * 创建canvas获取颜色
 * @param source 前景色
 * @param options 配置
 */
export function toRgbaByCanvas(
    source: string,
    options: RGBOptions = { format: RGBFormatType.Css }
) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 1;

    options.backgroundColor &&
        ((ctx!.fillStyle = options.backgroundColor),
        ctx!.fillRect(0, 0, canvas.width, canvas.height));

    ctx!.fillStyle = source;
    ctx!.fillRect(0, 0, canvas.width, canvas.height);
    const [r, g, b, _a] = ctx!.getImageData(0, 0, 1, 1).data;
    const a = formatFloatNumber(_a / 255, 2);

    if (options.format == RGBFormatType.Css) {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (options.format == RGBFormatType.Object) {
        return { red: r, green: g, blue: b, alpha: a };
    }
    return [r, g, b, a];
}

/**
 * 颜色拟合
 * @param source RGBA
 * @param background RGBA
 */
export function colorMerge(source: RGBA, background: RGBA) {
    const red = (1 - source.alpha) * background.red + source.alpha * source.red;
    const green =
        (1 - source.alpha) * background.green + source.alpha * source.green;
    const blue =
        (1 - source.alpha) * background.blue + source.alpha * source.blue;
    return { red, green, blue };
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
 * 人眼友好的灰度级别计算
 * 灰度计算方案 https://github.com/aooy/blog/issues/4
 *
 * @param color
 * @returns
 */
export function getGrayLevel({ red, green, blue }: RGB): number {
    return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
}

/**
 * 获取亮度计算
 * Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 * @returns
 */
export function getLuminance({ red, green, blue }: RGB): number {
    red /= 255;
    green /= 255;
    blue /= 255;

    const getGray = (color: number) => {
        return color < 0.03928
            ? color / 12.92
            : Math.pow((color + 0.055) / 1.055, 2.4);
    };

    return (
        0.2126 * getGray(red) + 0.7152 * getGray(green) + 0.0722 * getGray(blue)
    );
}
