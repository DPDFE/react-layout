import {
    Task,
    MessageQueue,
    CommunicationFormatterMessage
} from '../../src/community';

test('queue', () => {
    // 创建一个执行器函数，用于模拟执行任务
    function executor(task: Task<CommunicationFormatterMessage>) {
        console.log(`Executing task with priority ${task.message.data.max}`);
    }

    // 创建一个任务队列实例
    const priorityQueue = new MessageQueue({
        executor,
        /**
         * 如果有优先级（is_priority_queue = true）
         * 需要在message里增加priority
         */
        is_priority_queue: true
    });

    // 创建一些任务对象
    const task1 = new Task(
        new CommunicationFormatterMessage({
            sender: 'filter_id',
            receiver: 'chart_id',
            data: {
                max: 11
            },
            priority: 3
        })
    );
    const task2 = new Task(
        new CommunicationFormatterMessage({
            sender: 'filter_id',
            receiver: 'chart_id',
            data: {
                max: 12
            },
            priority: 1
        })
    );
    const task3 = new Task(
        new CommunicationFormatterMessage({
            sender: 'filter_id',
            receiver: 'chart_id',
            data: {
                max: 13
            },
            priority: 2
        })
    );
    const task4 = new Task(
        new CommunicationFormatterMessage({
            sender: 'filter_id',
            receiver: 'chart_id',
            data: {
                max: 14
            },
            priority: 2
        })
    );

    // 添加任务到队列
    priorityQueue.add(task1);
    priorityQueue.add(task2);
    priorityQueue.add(task3);
    priorityQueue.add(task4);

    // 运行任务队列
    priorityQueue.run();
});
