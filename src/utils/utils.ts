/** 格式化十进制四舍五入保留小数位 */
export function fomatFloatNumber(num: number, precision: number) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}

// TODO：函数拷贝不上，直接挂载到Object => Object.copy
export function copyObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export const noop = () => {};
