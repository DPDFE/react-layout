import { encodeParamsURI, decodeParamsURI } from '../src/url';

test('default url', () => {
    const url = encodeParamsURI('https://wuba.xinghuo.58.com', {
        header: 'aaa',
        user: 'bbb',
        target: 'ccc'
    });

    const params = decodeParamsURI(url);
    console.log(params, url);
});

test('group params url', () => {
    const url = encodeParamsURI('https://wuba.xinghuo.58.com?name=xxx', {
        header: 'aaa',
        user: 'bbb',
        target: 'ccc'
    });

    const params = decodeParamsURI(url);
    console.log(params, url);
});

test('chinese params url', () => {
    const url = encodeParamsURI('https://wuba.xinghuo.58.com?name=xxx', {
        header: '中文',
        user: 'bbb',
        target: 'ccc'
    });

    const params = decodeParamsURI(url);
    console.log(params, url);
});

test('long chinese params url', () => {
    const url = encodeParamsURI('https://wuba.xinghuo.58.com?name=xxx', {
        header: '请选择用户或用户组我是一个很长的中文字符中文',
        user: 'bbb',
        target: 'ccc'
    });

    const params = decodeParamsURI(url);
    console.log(params, url);
});

test('object params url', () => {
    const url = encodeParamsURI('https://wuba.xinghuo.58.com?name=xxx', {
        header: '请选择用户或用户组我是一个很长的中文字符中文',
        user: {
            name: 'bbb',
            age: 18,
            sex: 'male'
        },
        target: 'ccc'
    });

    const params = decodeParamsURI(url);
    console.log(params, url);
});
