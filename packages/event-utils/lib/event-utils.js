'use strict';
/** 添加event */
export function addEvent(el, event, handler, inputOptions) {
    if (!el)
        return;
    const options = Object.assign({ capture: true }, inputOptions);
    if (el.addEventListener) {
        el.addEventListener(event, handler, options);
    }
    else if (el.attachEvent) {
        el.attachEvent('on' + event, handler);
    }
    else {
        el['on' + event] = handler;
    }
}
/** 删除event */
export function removeEvent(el, event, handler, inputOptions) {
    if (!el)
        return;
    const options = Object.assign({ capture: true }, inputOptions);
    if (el.removeEventListener) {
        el.removeEventListener(event, handler, options);
    }
    else if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    }
    else {
        el['on' + event] = null;
    }
}
