/** 数值类型 */
export function isNumber(num: any) {
    return !isNaN(Number(num));
}

/** 格式化十进制四舍五入保留小数位 */
export function formatFloatNumber(num: number, precision: number) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}

/* 格式化数值为固定小数位数
>>> toFixedNumber(0.4517, 1)
0.5
*/
export function toFixedNumber(num: number, fraction: number): number {
    return Number(Number(num).toFixed(fraction));
}

/* 格式化数值为百分比，支持设定小数位数
>>> formatNumberToPercent(0.4517, 1)
45.2%
*/
export function formatNumberToPercentString(
    data: number | '' | '0' | 'null' | '-' | '(NULL)',
    fraction?: number
): string {
    if (!isNumber(data) || data === '') {
        return data as string;
    }
    data = (data as number) * 100;

    // 小数位数
    if (fraction != null) {
        data = data = toFixedNumber(data, fraction!);
    }

    return data + '%';
}

/**
 * 千分位
 * @param num 数值
 * @returns
 */
export function getThousandthSeparatedNumber(num: any) {
    if (!isNumber(num)) {
        return num;
    }
    const sep = function (str: string) {
        return (str + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
    };
    num = num + '';
    num = num.split('.');
    const num_0 = sep(num[0]);
    if (num.length === 1) {
        return num_0;
    }
    return num_0 + '.' + num[1];
}

/** 单位 */
export enum Unit {
    '无' = '无',
    'K' = 'K',
    '千' = '千',
    '万' = '万',
    '亿' = '亿',
    '兆' = '兆',
    'M' = 'M',
    '百万' = '百万',
    'B' = 'B'
}
/**
 * 格式化单位
 * @param num 数值
 * @param unit_value 单位
 * @param fraction 小数位数
 * @returns
 */
export function formatNumberUnit(
    num: number,
    unit_value: Unit,
    fraction?: number
) {
    switch (unit_value) {
        case '无':
            break;

        case 'K':
        case '千':
            num = num / 1000;
            break;

        case '万':
            num = num / 10000;
            break;

        case 'M':
        case '百万':
            num = num / 100_0000;
            break;

        case '亿':
            num = num / 1_0000_0000;
            break;

        case 'B':
            num = num / 10_0000_0000;
            break;
    }

    if (fraction != null) {
        num = toFixedNumber(num, fraction!);
    }

    return num;
}

// 将数字转的为人眼好识别的文字
export function readableNumbers(num: number, base = 1000): string {
    if (isNaN(num * 1)) {
        return num.toString();
    }

    const neg = num < 0;
    const units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    if (neg) {
        num = -num;
    }

    if (num < 1) {
        return (neg ? '-' : '') + num;
    }

    const exponent = Math.min(
        Math.floor(Math.log(num) / Math.log(base)),
        units.length - 1
    );

    num = Number((num / Math.pow(base, exponent)).toFixed(2));

    const unit = units[exponent];

    return (neg ? '-' : '') + num + unit;
}

/** 数字转中文 */
export function number2Chinese(num: number) {
    const units = ['', '十', '百', '千', '万', '亿'];
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (num === 0) {
        return '零';
    }

    let result = '';
    let numStr = num.toString();

    for (let i = 0; i < numStr.length; i++) {
        let digit = parseInt(numStr[i]);
        let unit = numStr.length - i - 1;

        if (digit === 0) {
            if (unit === 4 || unit === 8) {
                result += units[unit];
            } else if (result[result.length - 1] !== '零') {
                result += digits[digit];
            }
        } else {
            result += digits[digit] + units[unit];
        }
    }

    return result;
}
