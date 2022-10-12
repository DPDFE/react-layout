import ColorKeywords from './constants';

/**
 * isHex
 * @param color
 * @returns
 */
export function isHex(color: string): boolean {
    if (typeof color !== 'string') return false;
    const regex = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    return regex.test(color);
}

/**
 * isRbg
 * @param color
 * @returns
 */
export function isRbg(color: string): boolean {
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
 * 获取关键词颜色
 * @param color
 */
export function getKeywordColor(color: string): string | undefined {
    const hex = ColorKeywords[color as keyof typeof ColorKeywords];
    return hex ? hex : undefined;
}
