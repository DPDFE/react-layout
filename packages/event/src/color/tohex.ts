import { isHex, getKeywordColor } from './base';

// 重载方法定义
export function toHex(red: string): string;
export function toHex(red: number, green: number, blue: number): string;
export function toHex(
    red: number,
    green: number,
    blue: number,
    alpha: number | string
): string;

/**
 * 转化 Hex
 * @description 支持转化keyword、rgb、rgba、hex多种形式统一化处理
 */
export function toHex(
    red: string | number,
    green?: number,
    blue?: number,
    alpha?: string | number
) {
    let _,
        isPercent = (red + (alpha?.toString() || '')).toString().includes('%');

    if (typeof red === 'string') {
        // keyword
        const keyword = getKeywordColor(red);
        if (keyword) {
            return keyword;
        }

        // default
        if (red.startsWith('#')) {
            if (isHex(red)) {
                return red;
            } else {
                throw new Error('Is not a correct hex color');
            }
        }
        // rgba/rbg to hex
        else if (red.startsWith('rgb')) {
            try {
                const data = red
                    .toLowerCase()
                    .match(new RegExp('[rgb|rgba]\\((.*)\\)'));

                [
                    // rgba / alpha
                    red,
                    green,
                    blue,
                    alpha
                ] = data![1]
                    .split(/,|\/|%| /)
                    .filter((r) => ![' ', '/', ',', '%', ''].includes(r))
                    .map((color) => (color ? Number(color) : NaN));
            } catch (e) {
                throw new Error(
                    'toHex ' +
                        (red ?? '') +
                        (green ?? '') +
                        (blue ?? '') +
                        (alpha ?? '') +
                        ' error'
                );
            }
        }
    } else {
        // percent
        alpha = alpha && Number.parseFloat(alpha.toString());
    }

    if (
        typeof red !== 'number' ||
        typeof green !== 'number' ||
        typeof blue !== 'number' ||
        red > 255 ||
        green > 255 ||
        blue > 255
    ) {
        throw new Error('Expected three numbers below 256');
    }

    if (typeof alpha === 'number') {
        if (!isPercent && alpha >= 0 && alpha <= 1) {
            alpha = Math.round(255 * alpha);
        } else if (isPercent && alpha >= 0 && alpha <= 100) {
            alpha = Math.round((255 * alpha) / 100);
        } else {
            throw new Error(
                `Expected alpha value (${alpha}) as a fraction or percentage`
            );
        }

        alpha = (alpha | (1 << 8)).toString(16).slice(1);
    } else {
        alpha = '';
    }

    return (
        '#' +
        (
            Math.round(blue) |
            (Math.round(green) << 8) |
            (Math.round(red) << 16) |
            (1 << 24)
        )
            .toString(16)
            .slice(1) +
        alpha
    );
}
