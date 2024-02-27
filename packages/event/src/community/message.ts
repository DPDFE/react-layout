/**
 * 单向通信
 * 有接收方和发送方的概念
 */
export class CommunicationFormatterMessage {
    /** 发送方 */
    sender: string;
    /** 接收方 */
    receiver: string;
    /** 参数 */
    data: Record<string, any>;
    /** 发送时间 */
    timestamp = new Date().getTime();
    /** 优先级 */
    priority = Infinity;

    constructor({
        sender,
        receiver,
        data,
        priority
    }: {
        sender: string;
        receiver: string;
        data: Record<string, any>;
        priority?: number;
    }) {
        this.sender = sender;
        this.receiver = receiver;
        this.data = data;
        if (priority !== undefined) {
            this.priority = priority;
        }
    }
}

/**
 * 双向通信 —— 信道和信息
 */
export class ChannelFormatterMessage {
    /** 管道 */
    channel: string;
    /** 行为 */
    action: string;
    /** 参数 */
    data: Record<string, any>;
    /** 发送时间 */
    timestamp = new Date().getTime();

    constructor({
        channel,
        action,
        data
    }: {
        channel: string;
        action: string;
        data: Record<string, any>;
    }) {
        this.channel = channel;
        this.action = action;
        this.data = data;
    }
}
