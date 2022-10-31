/**
 * 获取一个永不重复的ID
 * @returns
 */
export function genAutoIdString(): string {
    return genRandomId().toString(36);
}

/**
 * 不重复的数值ID
 * @returns
 */
export function genRandomId() {
    const random = Math.random().toString().substr(2, 3);
    const time = Date.now();
    return Number(random + time);
}

/**
 * 全局可迭代auto id
 */
let global_target_func_lut: {
    [key: string]: Generator<number, void, unknown> | undefined;
} = {
    default: undefined
};

/**
 * 生成可迭代范围
 */
function* makeRangeIterator(start = genRandomId(), end = Infinity, step = 1) {
    for (let i = start; i < end; ) {
        yield i;
        i += step;
    }
}

type Options = {
    key?: string;
    start?: number;
    step?: number;
};

/**
 * 初始化迭代器参数
 * @param param0.key 迭代器分组
 * @param param0.start 迭代器的开始值，只当生成器创建时生效
 * @param param0.step 迭代器的步长
 */
export const genAutoIdInit = (
    { key, start, step }: Options = { key: 'default' }
) => {
    const unique_key = key ?? 'default';

    if (!global_target_func_lut[unique_key]) {
        global_target_func_lut[unique_key] = makeRangeIterator(
            start,
            Infinity,
            step
        );
    }
};

/**
 * 用生成器生成一个动态迭代器，封装成一个可以自增的ID触发器
 * @param key 迭代器分组
 * @returns
 */
export function genAutoId(key: string = 'default') {
    if (!global_target_func_lut[key]) {
        genAutoIdInit({ key });
    }

    return global_target_func_lut[key]?.next().value as number;
}
