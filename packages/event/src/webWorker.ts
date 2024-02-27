class WorkerWrapper {
    constructor(workerScript) {
        this.worker = new Worker(workerScript);
        this.promises = {};
        this.messageId = 0;

        this.worker.onmessage = (event) => {
            const { id, result, error } = event.data;
            if (this.promises[id]) {
                if (error) {
                    this.promises[id].reject(error);
                } else {
                    this.promises[id].resolve(result);
                }
                delete this.promises[id];
            }
        };
    }

    postMessage(message) {
        return new Promise((resolve, reject) => {
            const id = this.messageId++;
            this.promises[id] = { resolve, reject };
            this.worker.postMessage({ id, message });
        });
    }

    terminate() {
        this.worker.terminate();
    }
}

// 创建 WorkerWrapper 实例
const worker = new WorkerWrapper('worker.js');

// 向 Worker 发送消息并处理响应
worker
    .postMessage({ type: 'add', numbers: [1, 2, 3] })
    .then((result) => {
        console.log('Sum:', result);
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .finally(() => {
        // 终止 Worker
        worker.terminate();
    });

// worker.js
// 监听主线程发送的消息
self.onmessage = function (event) {
    const message = event.data;
    handleMessage(message);
};

// 处理接收到的消息
function handleMessage(message) {
    // 在这里处理接收到的消息
    console.log('Received message:', message);

    // 示例：向主线程发送响应
    const response = 'Hello from worker.js';
    self.postMessage(response);
}
