import { CommunicationFormatterManager } from '.';

/** 任务信息 */
export class Task {
    task: CommunicationFormatterManager;
    constructor(task: CommunicationFormatterManager) {
        this.task = task;
    }
}

/** 任务优先级队列 */
export class MessagePriorityQueue {
    queue: CommunicationFormatterManager[] = [];
    constructor() {
        this.queue = [];
    }

    /** 添加任务 */
    add() {}

    /** 删除任务 */
    delete() {}

    /** 运行任务 */
    run() {}
}
