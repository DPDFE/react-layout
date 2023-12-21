// import { MessageQueue, Producer, Consumer } from '../../src/community/mutiple';
import {
    MessageQueue,
    Producer,
    Consumer
} from '../../src/community/epoll_queue';

test('mutiple_queue', async () => {
    // 创建消息队列实例
    const messageQueue = new MessageQueue();
    // 创建生产者实例
    const producer1 = new Producer('Producer 1', messageQueue);
    const producer2 = new Producer('Producer 2', messageQueue);

    // 创建消费者实例
    const consumer1 = new Consumer('Consumer 1', messageQueue);
    const consumer2 = new Consumer('Consumer 2', messageQueue);

    // 将生产者和消费者添加到消息队列
    messageQueue.addProducer(producer1);
    messageQueue.addProducer(producer2);
    await messageQueue.addConsumer(consumer1);
    await messageQueue.addConsumer(consumer2);

    // 生产者广播消息
    producer1.sendMessage('Hello from producer 1!');
    producer2.sendMessage('Hello from producer 2!');
    // producer1.sendMessage('Hello from producer 3!');
    // producer2.sendMessage('Hello from producer 4!');
    // producer2.sendMessage('Hello from producer 5!');
    // producer1.sendMessage('Hello from producer 6!');
    // producer2.sendMessage('Hello from producer 7!');
    // producer1.sendMessage('Hello from producer 8!');
    // producer2.sendMessage('Hello from producer 9!');
    // producer2.sendMessage('Hello from producer 10!');
    // producer1.sendMessage('Hello from producer 11!');
    // producer2.sendMessage('Hello from producer 12!');
});
