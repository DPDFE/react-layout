import {
    decodeHashURI,
    decodeParamsURI,
    encodeHashURI,
    encodeParamsURI,
    setEncodeParams,
    getDecodeParams
} from './url';

declare global {
    interface URL {
        encodeParamsURI: (params: Record<string, any>) => string;
        decodeParamsURI: () => Record<string, any>;
        encodeHashURI: (params: Record<string, any>) => string;
        decodeHashURI: () => Record<string, any>;
    }
}

/** 给URL上添加加密的params属性 */
URL.prototype.encodeParamsURI = function (params: Record<string, any>) {
    setEncodeParams(this.searchParams, params);
    return this.toString();
};

/** 解密URL上params属性 */
URL.prototype.decodeParamsURI = function () {
    const default_params = this.searchParams;
    return getDecodeParams(default_params);
};

/** 给URL上添加加密的hash属性 */
URL.prototype.encodeHashURI = function (params: Record<string, any>) {
    const hash = this.hash.slice(1);
    const hash_params = new URLSearchParams(hash);
    setEncodeParams(hash_params, params);
    this.hash = hash_params.toString();
    return this.toString();
};

/** 解密URL上hash属性 */
URL.prototype.decodeHashURI = function () {
    const hash = this.hash.slice(1);
    const hash_params = new URLSearchParams(hash);
    return getDecodeParams(hash_params);
};

export { encodeParamsURI, decodeParamsURI, encodeHashURI, decodeHashURI };
