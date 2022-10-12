import { isHex, getKeywordColor } from './base';

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
            if (red.includes(',')) {
                [_, red, green, blue, alpha] = red
                    .replace(/ /g, '')
                    .match(
                        /(?<=\()(\d+),(\d+),(\d+),?((?:0?\.\d+)|1|0|\d+)?%?(?=\))/
                    )
                    ?.map((color) => (color ? Number(color) : undefined));
            }
            // rgba / alpha
            else {
                [_, red, green, blue, alpha] = red
                    .match(
                        /(?<=\()(\d+) *(\d+) *(\d+) *\/* *((?:0?\.\d+)|1|0|\d+)?%?(?=\))/
                    )
                    ?.map((color) => (color ? Number(color) : undefined));
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
        (blue | (green << 8) | (red << 16) | (1 << 24)).toString(16).slice(1) +
        alpha
    );
}
