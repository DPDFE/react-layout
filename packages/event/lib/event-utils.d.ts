/** 添加event */
export declare function addEvent(el: any, event: string, handler: EventListenerOrEventListenerObject, inputOptions?: Object): void;
/** 删除event */
export declare function removeEvent(el: any, event: string, handler: EventListenerOrEventListenerObject, inputOptions?: Object): void;
export declare function isFunction(func: any): boolean;
export declare function matchesSelector(el: Node, selector: string): boolean;
/** 找到从当前元素一直找到baseNode是否有selector */
export declare function matchesSelectorAndParentsTo(el: Node, selector: string, baseNode: Node): boolean;
