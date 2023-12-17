import {
    encodeParamsURI,
    decodeParamsURI,
    encodeHashURI,
    decodeHashURI
} from '../src/url';
/** TEST encodeParamsURI、decodeParamsURI */
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

test('object params anchor url', () => {
    const url =
        encodeParamsURI('https://wuba.xinghuo.58.com?name=xxx', {
            header: '请选择用户或用户组我是一个很长的中文字符中文',
            user: {
                name: 'bbb',
                age: 18,
                sex: 'male'
            },
            target: 'ccc'
        }) + '#anchor=111';

    const params = decodeParamsURI(url);
    console.log(params, url);
});

/** TEST encodeHashURI、decodeHashURI */
test('default hash url', () => {
    const url = encodeHashURI('https://wuba.xinghuo.58.com#hash=111', {
        header: 'aaa',
        user: 'bbb',
        target: 'ccc'
    });

    const hash = decodeHashURI(url);
    console.log(hash, url);
});

/** TEST prototype encodeParamsURI、decodeParamsURI */
test('default url prototype url', () => {
    const url = new URL('https://wuba.xinghuo.58.com#hash=111');
    const encode_url = url.encodeParamsURI({
        header: 'aaa',
        user: 'bbb',
        target: 'ccc'
    });

    const params = new URL(encode_url).decodeParamsURI();
    console.log(params, url);
});

/** TEST prototype encodeHashURI、decodeHashURI */
test('default url prototype url', () => {
    const url = new URL('https://wuba.xinghuo.58.com#hash=111');
    const encode_url = url.encodeHashURI({
        header: 'aaa',
        user: 'bbb',
        target: 'ccc'
    });

    const params = new URL(encode_url).decodeHashURI();
    console.log(params, url);
});
