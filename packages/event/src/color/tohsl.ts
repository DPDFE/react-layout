import { fomatFloatNumber } from '../utils';
import { RGBA, RGBFormatType, toRgba } from './torgba';

export interface HSLA {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
}

/**
 * rgba\rgb\hex\keyword转化为hsl
 * https://en.wikipedia.org/wiki/HSL_and_HSV
 * @param color
 * @returns
 */
export function toHsl(
    color: string,
    options: { format: RGBFormatType } = { format: RGBFormatType.Css }
) {
    let { red, green, blue, alpha } = toRgba(color, {
        format: RGBFormatType.Object
    }) as RGBA;

    const { h, s, l } = rgbToHsl(red, green, blue);

    if (options.format === RGBFormatType.Array) {
        return [h, s, l, alpha] as [number, number, number, number];
    } else if (options.format === RGBFormatType.Object) {
        return {
            hue: h,
            saturation: s,
            lightness: l,
            alpha
        } as HSLA;
    } else {
        return `hsla(${fomatFloatNumber(h * 360, 2)}, ${fomatFloatNumber(
            s * 100,
            2
        )}%, ${fomatFloatNumber(l * 100, 2)}%, ${alpha})`;
    }
}

/**
 * rgb to hsl
 * @param r red
 * @param g green
 * @param b blue
 * @returns
 */
function rgbToHsl(r: number, g: number, b: number) {
    (r /= 255), (g /= 255), (b /= 255);

    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);

    let h,
        s,
        l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            default:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return { h, s, l };
}

/**
 * 亮度计算
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 * @param color
 * @returns
 */
export function getGrayLevelByHsl({
    hue,
    saturation,
    lightness,
    alpha
}: HSLA): number {
    return lightness;
    // return (0.299 * hue + 0.587 * saturation + 0.114 * lightness) / 255;
}
