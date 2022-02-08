/** 统一处理浏览器兼容性问题 */
'use strict';

/** 添加event */
export function addEvent(
    el: any,
    event: string,
    handler: EventListenerOrEventListenerObject,
    inputOptions?: Object
): void {
    if (!el) return;

    const options = { capture: true, ...inputOptions };

    if (el.addEventListener) {
        el.addEventListener(event, handler, options);
    } else if (el.attachEvent) {
        el.attachEvent('on' + event, handler);
    } else {
        el['on' + event] = handler;
    }
}

/** 删除event */
export function removeEvent(
    el: any,
    event: string,
    handler: EventListenerOrEventListenerObject,
    inputOptions?: Object
): void {
    if (!el) return;
    const options = { capture: true, ...inputOptions };

    if (el.removeEventListener) {
        el.removeEventListener(event, handler, options);
    } else if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    } else {
        el['on' + event] = null;
    }
}
