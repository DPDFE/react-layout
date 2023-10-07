/**
 * 封装日志样式，支持颜色模式
 * eg: log(type, name, {color: 'red'; background: 'blue'; version: '1.0.0'})
 **/
export const log = (...args: any[]) => {
    const style = args[args.length - 1] as {
        color: string;
        background: string;
    };
    const _style = `color:${style.color}; background: ${style.background}; font-size: 12px`;

    let version = 'v0.0.1';
    if (args[args.length - 1].color || args[args.length - 1].background) {
        args.pop();
    }
    if (args[args.length - 1].version) {
        version = args[args.length - 1].version;
    }

    console.log(
        `%ctag%c${version}`,
        'padding: 2px 2px 0;' +
            'border-radius: 3px 0 0 3px;' +
            'color: #fff;' +
            'background: #606060;',
        'padding: 2px 2px 0;' +
            'border-radius: 0 3px 3px 0;' +
            'color: #fff;' +
            'background: #42c02e;'
    );

    args.map((arg) => {
        if (typeof arg === 'object') {
            console.log(arg);
        } else {
            const text = `${arg}`;
            console.log('%c' + text, _style);
        }
    });
};
