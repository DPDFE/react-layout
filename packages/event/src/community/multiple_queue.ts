/**
 * 创建一个消息队列对象
 * 生产者通知所有的消费者，
 * 一个消费者消费这个数据
 */
export class MessageQueue<T> {
    // 存储消息的数组
    messages: T[];
    // 存储生产者的数组
    producers: Producer<T>[];
    // 存储消费者的数组
    consumers: Consumer<T>[];

    constructor() {
        this.messages = [];
        this.producers = [];
        this.consumers = [];
    }

    // 添加生产者到队列
    addProducer(producer: Producer<T>) {
        this.producers.push(producer);
    }

    // 添加消费者到队列
    addConsumer(consumer: Consumer<T>) {
        this.consumers.push(consumer);
    }

    // 生产者向队列发送消息
    sendMessage(message: T) {
        // 将消息添加到消息队列
        this.messages.push(message);

        // 通知所有消费者有新消息到达
        this.consumers.forEach(function (consumer) {
            consumer.consumeMessage(message);
        });
    }

    // 消费者从队列接收消息
    receiveMessage(consumer: Consumer<T>) {
        if (this.messages.length > 0) {
            // 从消息队列中弹出一条消息
            const message = this.messages.shift();
            if (message) consumer.consumeMessage(message);
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
    receiveMessage() {
        this.messageQueue.receiveMessage(this);
    }

    // 处理接收到的消息
    consumeMessage(message: T) {
        console.log(`Consumer ${this.name} received message: ${message}`);
    }
}
