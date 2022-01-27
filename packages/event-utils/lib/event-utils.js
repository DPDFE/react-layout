'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/** 添加event */
export function addEvent(el, event, handler, inputOptions) {
    if (!el)
        return;
    var options = __assign({ capture: true }, inputOptions);
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
    var options = __assign({ capture: true }, inputOptions);
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
//# sourceMappingURL=event-utils.js.map