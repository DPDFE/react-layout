// 一个链表
class LinksHandler {
    fn: Function;
    private _next?: LinksHandler;

    constructor(fn: Function) {
        this.fn = fn;
    }

    next(_next: LinksHandler) {
        this._next = _next;
        return _next;
    }

    run(...rest: unknown[]) {
        this.fn(rest);
        this._next && this._next.run.apply(this._next, rest);
    }
}

export default LinksHandler;


