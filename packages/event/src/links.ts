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

// const aaa = new LinksHandler((token: string) => {
//     console.log('aaa', token);
// });

// const bbb = new LinksHandler((token: string) => {
//     console.log('bbb', token);
// });

// const ccc = new LinksHandler((token: string) => {
//     console.log('ccc', token);
// });

// aaa.next(bbb).next(ccc);
// aaa.run('token');
