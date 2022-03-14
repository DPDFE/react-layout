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

    const options = { capture: false, ...inputOptions };

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
    const options = { capture: false, ...inputOptions };

    if (el.removeEventListener) {
        el.removeEventListener(event, handler, options);
    } else if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    } else {
        el['on' + event] = null;
    }
}

export function isFunction(func: any): boolean {
    return (
        typeof func === 'function' ||
        Object.prototype.toString.call(func) === '[object Function]'
    );
}

let matches_selector_func = '';
export function matchesSelector(el: Node, selector: string): boolean {
    const matches_methods = [
        'matches',
        'webkitMatchesSelector',
        'mozMatchesSelector',
        'msMatchesSelector',
        'oMatchesSelector'
    ];
    if (!matches_selector_func) {
        matches_methods.map((method) => {
            // @ts-ignore
            matches_selector_func = isFunction(el[method]) ? el[method] : '';
        });
    }

    // @ts-ignore
    if (!isFunction(el[matches_selector_func])) return false;

    // @ts-ignore
    return el[matches_selector_func](selector);
}

/** 找到从当前元素一直找到baseNode是否有selector */
export function matchesSelectorAndParentsTo(
    el: Node,
    selector: string,
    baseNode: Node
): boolean {
    let node: Node | null = el;
    do {
        if (matchesSelector(node, selector)) return true;
        if (node === baseNode) return false;
        node = node.parentNode;
    } while (node);

    return false;
}
