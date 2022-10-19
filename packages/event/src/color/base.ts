import ColorKeywords from './constants';

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
