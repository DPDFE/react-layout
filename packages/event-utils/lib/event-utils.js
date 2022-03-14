/** 统一处理浏览器兼容性问题 */
'use strict';
/** 添加event */
export function addEvent(el, event, handler, inputOptions) {
    if (!el)
        return;
    const options = Object.assign({ capture: false }, inputOptions);
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
    const options = Object.assign({ capture: false }, inputOptions);
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
export function isFunction(func) {
    return (typeof func === 'function' ||
        Object.prototype.toString.call(func) === '[object Function]');
}
let matches_selector_func = undefined;
export function matchesSelector(el, selector) {
    const matches_methods = [
        'matches',
        'webkitMatchesSelector',
        'mozMatchesSelector',
        'msMatchesSelector',
        'oMatchesSelector'
    ];
    if (!matches_selector_func) {
        matches_selector_func = matches_methods
            .map((method) => {
            // @ts-ignore
            return isFunction(el[method]) ? method : '';
        })
            .find((state) => state != '');
    }
    // @ts-ignore
    if (!isFunction(el[matches_selector_func]))
        return false;
    // @ts-ignore
    return el[matches_selector_func](selector);
}
/** 找到从当前元素一直找到baseNode是否有selector */
export function matchesSelectorAndParentsTo(el, selector, baseNode) {
    let node = el;
    do {
        if (matchesSelector(node, selector))
            return true;
        if (node === baseNode)
            return false;
        node = node.parentNode;
    } while (node);
    return false;
}
