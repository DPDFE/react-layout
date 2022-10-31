import ColorKeywords from './constants';
import { RGB, RGBFormatType, toRgb } from './torgba';

/**
 * isHex
 * @param color
 * @returns
 */
export function isHex(color: string): boolean {
    if (typeof color !== 'string') return false;
    const regex = new RegExp(
        '^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$'
    );
    return regex.test(color);
}

/**
 * isRgb
 * @param color
 * @returns
 */
export function isRgb(color: string): boolean {
    if (typeof color !== 'string') return false;
    color = color.toLowerCase();

    return /^(rgb\()/.test(color);
}

/**
 * isRbga
 * @param color
 * @returns
 */
export function isRgba(color: string): boolean {
    if (typeof color !== 'string') return false;
    color = color.toLowerCase();

    return /^(rgba)/.test(color);
}

/**
 * isHsl
 * @param color
 * @returns
 */
export function isHsl(color: string): boolean {
    if (typeof color !== 'string') return false;
    color = color.toLowerCase();

    return /^(hsl)/.test(color);
}

/**
 * isHsl
 * @param color
 * @returns
 */
export function isHsla(color: string): boolean {
    if (typeof color !== 'string') return false;
    color = color.toLowerCase();

    return /^(hsla)/.test(color);
}

/**
 * 获取关键词颜色
 * @param color
 */
export function getKeywordColor(color: string): string | undefined {
    const hex = ColorKeywords[color as keyof typeof ColorKeywords];
    return hex ? hex : undefined;
}

/**
 * color clamp
 * @param data
 * @param min
 * @param max
 * @returns
 */
export const clamp = (data: number, min: number = 0, max: number = 255) => {
    return Math.min(Math.max(data, min), max);
};

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

/**
 * 颜色排序
 * @param gradient
 * @returns
 */
export function sortColors(
    gradient: string[],
    weightFunc?: ({ red, green, blue }: RGB) => number
) {
    return gradient
        .map((color) => {
            const { red, green, blue } = toRgb(color, {
                format: RGBFormatType.Object
            });
            const weight = weightFunc
                ? weightFunc({ red, green, blue })
                : red * 100 + green * 100 + blue;

            return {
                rgb: { red, green, blue },
                weight: weight,
                color
            };
        })
        .sort((a, b) => {
            return a.weight > b.weight ? 1 : -1;
        });
}
