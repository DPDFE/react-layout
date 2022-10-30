/**
 * 获取一个永不重复的ID
 * @returns
 */
export function genAutoIdString(): string {
    const random = Math.random().toString().substr(2, 3);
    const time = Date.now();
    return Number(random + time).toString(36);
}

/**
 * 全局可迭代auto id
 */
let global_target_func: Generator<number, void, unknown> | undefined =
    undefined;

/**
 * 生成可迭代范围
 */
function* makeRangeIterator(
    start = Number(Math.random().toString().substr(2, 10)),
    end = Infinity,
    step = 1
) {
    for (let i = start; i < end; ) {
        yield i;
        i++;
    }
}

type Options = { start?: number; is_next?: boolean };

/**
 * 用生成器生成一个动态迭代器，封装成一个可以自增的ID触发器
 */
export function genAutoId(
    { start, is_next }: Options = {
        is_next: false
    }
) {
    if (!global_target_func || is_next) {
        global_target_func = makeRangeIterator(start);
    }
    return global_target_func.next().value as number;
}
