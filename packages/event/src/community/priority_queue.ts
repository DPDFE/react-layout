/**
 * 一个队列执行器：
 * 任务可以支持有优先级的任务，
 * 批量执行，清空任务列表
 */
import { genAutoIdString } from '..';

/** 任务信息 */
export class Task<T> {
    message: T;

    constructor(message: T) {
        this.message = message;
    }
}

/** 任务优先级队列 */
export class MessageQueue<T> {
    /** 任务队列 */
    queue: Map<string, Task<T>> = new Map();
    /** 执行器 */
    executor: (token: string, task: Task<T>) => void;
    /** 是否是优先级队列 */
    is_priority_queue: boolean = false;

    constructor({
        executor,
        is_priority_queue
    }: {
        executor: (task: Task<T>) => void;
        is_priority_queue?: boolean;
    }) {
        this.is_priority_queue = is_priority_queue ?? false;
        this.queue = new Map();
        this.executor = (token: string, task: Task<T>) => {
            executor(task);
            this.delete(token);
        };
    }

    /** 添加任务 */
    add(task: Task<T>) {
        const token = genAutoIdString();
        this.queue.set(token, task);
        return token;
    }

    /** 删除任务 */
    delete(token: string) {
        this.queue.delete(token);
    }

    /** 运行任务 */
    run() {
        let sort_queue = this.is_priority_queue
            ? Array.from(this.queue.keys()).sort((a_token, b_token) => {
                  const a = this.queue.get(a_token)!;
                  const b = this.queue.get(b_token)!;
                  const a_priority = (a.message as any)?.priority ?? 0;
                  const b_priority = (b.message as any)?.priority ?? 0;
                  return a_priority > b_priority ? -1 : 1;
              })
            : Array.from(this.queue.keys());

        let token = sort_queue.shift();
        while (token) {
            this.executor(token, this.queue.get(token)!);
            token = sort_queue.shift();
        }
    }
}
