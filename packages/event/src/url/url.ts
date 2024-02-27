/**
 * 判断是否是url
 * @description url-链接
 */
export const isUrl = (url: string) => {
    if (typeof url === 'string') {
        const Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/i;
        const objExp = new RegExp(Expression);
        return objExp.test(url);
    }
    return false;
};

/**
 * 获取当前url上的hash参数
 * @param key 查询key
 * @returns value
 */
export const getURLHash = (key: string) => {
    const hash = window.location.hash.slice(1);
    const hash_params = new URLSearchParams(hash);
    return hash_params.get(key);
};

/**
 * 设置当前url上的hash参数
 */
export const setURLHash = (key: string, value: any) => {
    const url = new URL(window.location.href);
    const hash = window.location.hash.slice(1);
    const hash_params = new URLSearchParams(hash);
    hash_params.set(key, value);
    url.hash = hash_params.toString();
    return params;
};


/**
 * 获取当前url上的params参数
 * @param key
 * @returns
 */
export const getURLParams = (key: string) => {
    const params =
    return params.get(key);
};

/**
 * 设置当前url上的params参数
 */
export const setURLParams = () => {
    const params = new URLSearchParams(window.location.search);
    return params;
};

/**
 * 获取当前cookies
 */
export const setCookies = (key: string, value: any) => {
    const params = new URLSearchParams(window.location.search);
    return params;
};

/**
 * 设置当前cookies
 */
export const getCookies = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    return params;
};
