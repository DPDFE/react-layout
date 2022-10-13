import { toHex } from './tohex';

export enum RGBFormatType {
    Array = 'array',
    Object = 'object',
    Css = 'css'
}

export interface RGBA {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface RGBOptions {
    format?: RGBFormatType;
    alpha?: number;
}

/**
 *
 * @param color
 * @param options
 * @description 支持转化keyword、hex多种形式统一化处理生成object、array格式
 */
export function toRgba(
    color: string,
    options: RGBOptions = { format: RGBFormatType.Css }
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
        return [red, green, blue, alpha];
    }

    if (options.format === RGBFormatType.Object) {
        return { red, green, blue, alpha };
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
