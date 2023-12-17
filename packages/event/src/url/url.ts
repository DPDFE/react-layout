/**
 * 对URL上的参数增加加密参数
 * @param target_params 添加参数的URL对象
 * @param params 需要添加的参数
 * @returns
 */
export const setEncodeParams = (
    target_params: URLSearchParams,
    params: Record<string, any>
) => {
    Object.keys(params).forEach((p) => {
        const append = window.btoa(
            window.encodeURIComponent(JSON.stringify(params[p]))
        );
        target_params.set(p, append);
    });
    return target_params;
};

/**
 * 保留原始没有加密过的参数，对加密过的参数进行解密
 * @param default_params 原始URL上的参数信息
 * @returns 解密后的结果
 */
export const getDecodeParams = (default_params: URLSearchParams) => {
    const target_params: Record<string, any> = {};
    for (const [key, value] of default_params.entries()) {
        if (value) {
            try {
                const decode = JSON.parse(
                    window.decodeURIComponent(window.atob(value))
                );
                target_params[key] = decode;
            } catch (e) {
                target_params[key] = value;
            }
        }
    }
    return target_params;
};

/** 给URL上添加加密的params属性 */
export const encodeParamsURI = (uri: string, params: Record<string, any>) => {
    const url = new URL(uri);
    setEncodeParams(url.searchParams, params);
    return url.toString();
};

/** 解密URL上params属性 */
export const decodeParamsURI = (uri: string) => {
    const default_params = new URL(uri).searchParams;
    return getDecodeParams(default_params);
};

/** 给URL上添加加密的hash属性 */
export const encodeHashURI = (uri: string, params: Record<string, any>) => {
    const url = new URL(uri);
    const hash = url.hash.slice(1);
    const hash_params = new URLSearchParams(hash);
    setEncodeParams(hash_params, params);
    url.hash = hash_params.toString();
    return url.toString();
};

/** 解密URL上hash属性 */
export const decodeHashURI = (uri: string) => {
    const hash = new URL(uri).hash.slice(1);
    const hash_params = new URLSearchParams(hash);
    return getDecodeParams(hash_params);
};
