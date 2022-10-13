import { toHex } from './tohex';
import { RGBFormatType, RGBA, toRgba } from './torgba';

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
    return getColorByPercent(color, { ...options, direction: Direction.Lower });
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
    return getColorByPercent(color, { ...options, direction: Direction.Upper });
}

/**
 * 更新颜色
 * @param color
 * @param options
 */
function getColorByPercent(
    color: string,
    options: ColorLineOptions & { direction: Direction } = {
        percent: 5,
        direction: Direction.Upper
    }
) {
    const current = toRgba(color, { format: RGBFormatType.Object }) as RGBA;
    const max = toRgba(options.max ?? '#00000000', {
        format: RGBFormatType.Object
    }) as RGBA;
    const min = toRgba(options.min ?? '#FFFFFFFF', {
        format: RGBFormatType.Object
    }) as RGBA;

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

    const alpha =
        current.alpha -
        ((max.alpha - min.alpha) / 100) * options.percent * direction;

    return `rgba(${clamp(red)}, ${clamp(green)}, ${clamp(blue)}, ${clamp(
        alpha,
        0,
        1
    )})`;
}

/**
 * 获取颜色透明度
 * @param color
 */
export function getOpacity(color: string) {
    return (toRgba(toHex(color), { format: RGBFormatType.Object }) as RGBA)
        .alpha;
}