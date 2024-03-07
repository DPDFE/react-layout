/**
 * 封装worker方法
 */
class WorkerWrapper {
    worker: Worker;
    promises: {
        [id: number]: {
            resolve: (value?: any) => void;
            reject: (reason?: any) => void;
        };
    };

    message_id: number;

    constructor(workerScript: string) {
        this.worker = new Worker(workerScript);
        this.promises = {};
        this.message_id = 0;

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

    postMessage<T>(message: { action: string; data: T }) {
        return new Promise((resolve, reject) => {
            const id = this.message_id++;
            this.promises[id] = { resolve, reject };
            this.worker.postMessage({ id, message });
        });
    }

    terminate() {
        this.worker.terminate();
    }
}

export default WorkerWrapper;

// 创建一个简单的 worker 脚本，该脚本会计算传入的数字的平方
const workerScript = `
    self.onmessage = function(event) {
        const number = event.data;
        const result = number * number;
        self.postMessage(result);
    };
`;

// 创建 WorkerWrapper 实例
const workerWrapper = new WorkerWrapper(workerScript);

// 发送消息到 worker 并等待结果
workerWrapper
    .postMessage({ action: 'calculate', data: 5 })
    .then((result) => {
        console.log('Result:', result); // 输出: Result: 25
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .finally(() => {
        // 终止 worker
        workerWrapper.terminate();
    });
