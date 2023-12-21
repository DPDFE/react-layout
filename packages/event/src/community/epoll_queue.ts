import { genAutoIdString } from '..';

/**
 * 消息队列对象
 * 场景：生产者生产一条数据通知所有消费者，消费者中选择一个消费者消费，
 * 消费有时长，在等待过程中，生产者会生产内容，其他的消费者消费。
 * 内容不针对特定消费者，消费者不存在差异。
 * 场景：线程池
 */
export class MessageQueue<T> {
    // 存储消息的数组
    messages: Map<string, T> = new Map();
    // 存储生产者的数组
    producers: Producer<T>[];
    // 存储消费者的数组
    consumers: Consumer<T>[];

    constructor() {
        this.messages = new Map();
        this.producers = [];
        this.consumers = [];
    }

    // 添加生产者到队列
    addProducer(producer: Producer<T>) {
        this.producers.push(producer);
    }

    // 添加消费者到队列
    async addConsumer(consumer: Consumer<T>) {
        this.consumers.push(consumer);
        /** 通知消费者来消费 */
        await this.noticeMessage();
    }

    // 从队列中移除消费者
    removeConsumer(consumer: Consumer<T>) {
        const index = this.consumers.indexOf(consumer);
        if (index > -1) {
            this.consumers.splice(index, 1);
        }
    }

    // 生产者向队列发送消息
    async sendMessage(message: T) {
        const token = genAutoIdString();
        // 将消息添加到消息队列
        this.messages.set(token, message);
        /** 通知消费者来消费 */
        await this.noticeMessage();
    }

    // 通知所有存在的消费者有新消息到达
    async noticeMessage() {
        for (const consumer of this.consumers) {
            const res = await consumer.receiveMessage();
            if (res.success) {
                break;
            }
        }
    }

    // 消费者从消息列表中接收消息
    async receiveMessage(consumer: Consumer<T>) {
        const token = this.messages.keys().next().value;
        const message = this.messages.get(token);

        /** 如果消息存在，说明没人消费可以处理 */
        if (message) {
            this.removeConsumer(consumer);
            const res = await consumer.consumeMessage(message);
            // @ts-ignore
            console.log(res.message);
            this.messages.delete(token);
            this.addConsumer(consumer);

            return { success: true };
        } else {
            return { success: false };
        }
    }
}

// 创建生产者对象
export class Producer<T> {
    // 消息队列名称
    name: string;
    // 消息队列对象
    messageQueue: MessageQueue<T>;

    constructor(name: string, messageQueue: MessageQueue<T>) {
        this.name = name;
        this.messageQueue = messageQueue;
    }

    // 发送消息
    sendMessage(message: T) {
        this.messageQueue.sendMessage(message);
    }
}

// 创建消费者对象
export class Consumer<T> {
    // 消息队列名称
    name: string;
    // 消息队列对象
    messageQueue: MessageQueue<T>;

    constructor(name: string, messageQueue: MessageQueue<T>) {
        this.name = name;
        this.messageQueue = messageQueue;
    }
    // 接收消息
    async receiveMessage() {
        return await this.messageQueue.receiveMessage(this);
    }

    // 处理接收到的消息
    consumeMessage(message: T) {
        const time = Math.random() * 1000;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    message: `Consumer ${this.name} \n received message: ${message}`
                });
            }, time);
        });
    }
}
