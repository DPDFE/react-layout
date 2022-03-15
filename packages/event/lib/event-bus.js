'use strict';
function Events() { }
if (Object.create) {
    Events.prototype = Object.create(null);
}
/**
 * 保存监听属性
 * @param fn
 * @param context
 * @param once 是否触发一次
 */
function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}
function removeListener() { }
function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
    }
}
function clearEvent() { }
function EventEmitter() {
    const _events = Events();
    const _eventsCount = 0;
}
EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.EventEmitter = EventEmitter;
const EventBus = EventEmitter();
export default EventBus;
