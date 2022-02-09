/** 格式化十进制四舍五入保留小数位 */
export function fomatFloatNumber(num: number, precision: number) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}

export function copyObjectArray<T>(arr: T[]): T[] {
    return [].concat(JSON.parse(JSON.stringify(arr)));
}

export function copyObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function diffObject(obj1: Object, obj2: Object) {
    if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        return true;
    } else {
        return false;
    }
}
