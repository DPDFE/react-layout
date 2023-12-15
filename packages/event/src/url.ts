/** 加密URL上属性 */
const encodeParamsURI = (uri: string, params: Record<string, any>) => {
    Object.keys(params).forEach((p) => {
        const append = `${p}=${window.btoa(
            window.encodeURIComponent(JSON.stringify(params[p]))
        )}`;

        if (uri.indexOf('?') > -1) {
            uri += '&';
        } else {
            uri += '?';
        }
        uri += append;
    });

    return uri;
};

/** 解密URL上属性 */
const decodeParamsURI = (uri: string) => {
    const default_params = new URL(uri).search.replace('?', '').split('&');
    const target_params: Record<string, any> = {};
    default_params.forEach((p) => {
        const [key, value] = p.split('=');
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
    });
    return target_params;
};

export { encodeParamsURI, decodeParamsURI };
