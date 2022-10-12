import { toHex } from './tohex';
import { FormatType, RGBA, toRgba } from './torgba';

/**
 * 加深
 * @param color
 * @param percent
 */
export function darken(color: string, percent: number) {}

/**
 * 提亮
 * @param color
 */
export function lighten(color: string, percent: number) {}

/**
 * 获取颜色透明度
 * @param color
 */
export function getOpacity(color: string) {
    return (toRgba(toHex(color), { format: FormatType.Object }) as RGBA).alpha;
}
