// TODO：函数拷贝不上，直接挂载到Object => Object.copy
export function copyObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export const noop = () => {};
