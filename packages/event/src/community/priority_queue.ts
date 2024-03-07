/**
 * 生产者、消费者、优先级队列
 * 生产者生产到优先级任务，任务指定消费者消费
 */
type Task = {
    id: number;
    priority: number;
    consumerId: number;
};

class ProducerManager {
    private producers: Map<number, Producer>;

    constructor() {
        this.producers = new Map();
    }

    registerProducer(producerId: number) {
        const producer = new Producer(producerId);
        this.producers.set(producerId, producer);
        return producer;
    }

    getProducer(producerId: number) {
        return this.producers.get(producerId) || null;
    }
}

class ConsumerManager {
    consumers: Map<number, Consumer>;

    constructor() {
        this.consumers = new Map();
    }

    registerConsumer(consumerId: number) {
        const consumer = new Consumer(consumerId);
        this.consumers.set(consumerId, consumer);
        return consumer;
    }

    getConsumer(consumerId: number) {
        return this.consumers.get(consumerId) || null;
    }
}

class PriorityQueue {
    private tasks: Task[];

    constructor() {
        this.tasks = [];
    }

    enqueue(task: Task) {
        this.tasks.push(task);
        this.tasks.sort((a, b) => b.priority - a.priority);
    }

    dequeue() {
        return this.tasks.shift() || null;
    }

    isEmpty() {
        return this.tasks.length === 0;
    }
}

class Producer {
    private producerId: number;
    private queue: PriorityQueue;

    constructor(producerId: number) {
        this.producerId = producerId;
        this.queue = new PriorityQueue();
    }

    produceTask(priority: number, consumerId: number) {
        const task: Task = {
            id: Date.now(),
            priority,
            consumerId
        };

        this.queue.enqueue(task);
    }

    consumeTask() {
        if (!this.queue.isEmpty()) {
            return this.queue.dequeue();
        }

        return null;
    }
}

class Consumer {
    consumerId: number;

    constructor(consumerId: number) {
        this.consumerId = consumerId;
    }

    consumeTask(task: Task) {
        console.log(`Consumer ${this.consumerId} is consuming task:`, task);
        // 执行任务的消费逻辑
    }
}

export { ProducerManager, ConsumerManager };

// 示例用法
const producerManager = new ProducerManager();
const consumerManager = new ConsumerManager();

const producer1 = producerManager.registerProducer(1);
const producer2 = producerManager.registerProducer(2);

const consumer1 = consumerManager.registerConsumer(1);
const consumer2 = consumerManager.registerConsumer(2);

producer1.produceTask(2, consumer1.consumerId);
producer2.produceTask(1, consumer2.consumerId);
producer1.produceTask(3, consumer2.consumerId);
producer2.produceTask(1, consumer1.consumerId);

let task = producer1.consumeTask();
if (task) {
    const consumer = consumerManager.getConsumer(task.consumerId);
    if (consumer) {
        consumer.consumeTask(task);
    }
}

task = producer2.consumeTask();
if (task) {
    const consumer = consumerManager.getConsumer(task.consumerId);
    if (consumer) {
        consumer.consumeTask(task);
    }
}
