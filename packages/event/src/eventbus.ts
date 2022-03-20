'use strict';

import { isFunction } from "./utils";

class EE {
    fn: Function;
    once: boolean;

    constructor(fn: Function, once = false) {
        this.fn = fn;
        this.once = once;
    }
}

/**
 * 触发器
 */
class EventEmitter {
    listeners: EE[] = [];
    max_listener_size = Infinity;

    setMaxListeners = (size: number) => {
        this.max_listener_size = size;
    };

    emit = (...rest: unknown[]) => {
        this.listeners.map((l) => {
            l.fn(...rest)
            l.once && this.removeListener(l.fn)
        })
    }

    addListener = (listener: Function, once = false) => {
        if (isFunction(listener)) {
            if (this.listeners.length >= this.max_listener_size) {
                console.error(
                    `Number of listener cannot exceeds ${this.max_listener_size}`,
                );
                return false;
            } else {
                this.listeners.push(new EE(listener, once));
                return true;
            }
        } else {
            throw new Error('callback must be a function');
        }

    };

    removeListener = (listener: Function) => {
        this.listeners = this.listeners.filter((l) => l.fn != listener);
    };
}

/**
 * 事件列表
 */
class Events {
    events: Record<string, EventEmitter> = {};

    checkEventRegister = (event: string) => {
        if (!this.events[event]) {
            console.error(`${event} is not registered`);
        }
    };

    // 为指定事件添加一个监听器到监听器数组的尾部
    addListener = (event: string, listener: Function) => {
        this.events[event] = this.events[event] || new EventEmitter();
        return this.events[event].addListener(listener);
    };

    // 移除指定事件的某个监听器，监听器必须是该事件已经注册过的监听器。
    removeListener = (event: string, listener?: Function) => {
        this.checkEventRegister(event);
        if (listener) {
            this.events[event]?.removeListener(listener);
        } else {
            delete this.events[event];
        }
        return true;
    };

    // 移除所有事件的所有监听器， 如果指定事件，则移除指定事件的所有监听器。
    removeAllListeners = (events?: string[]) => {
        if (events) {
            events.map((event) => {
                this.checkEventRegister(event);
                delete this.events[event];
            });
        } else {
            this.events = {};
        }
    };

    on = this.addListener;
    off = this.removeListener;
    clear = this.removeAllListeners;

    // 为指定事件注册一个单次监听器
    once = (event: string, listener: Function) => {
        this.events[event] = this.events[event] || new EventEmitter();
        return this.events[event].addListener(listener, true);
    };

    // 触发一个事件
    emit = (event: string, ...rest: unknown[]) => {
        this.checkEventRegister(event);
        event && this.events[event]?.emit(...rest);
    };

    // 默认情况下， EventEmitters 如果你添加的监听器超过 10 个就会输出警告信息。 setMaxListeners 函数用于改变监听器的默认限制的数量。
    setMaxListeners = (event: string, n: number) => {
        this.checkEventRegister(event);
        this.events[event]?.setMaxListeners(n);
    };

    // 返回指定事件的监听器数组。
    listeners = (event: string) => {
        this.checkEventRegister(event);
        return this.events[event];
    };

    getAllEvents = () => {
        return Object.keys(this.events);
    };
}

export default Events;
