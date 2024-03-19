/**
 * 添加一些用户信息，方便排查问题
 * @param headers - 请求头
 */
function addUserInfo(user_name: string) {
    const headers: Record<string, any> = {};
    // 添加用户信息
    tryIt(() => {
        headers['fe-oa'] = user_name;
    });

    // 添加网站信息
    tryIt(() => {
        const meta_el = document.querySelector(
            'head [data-build-time]'
        ) as HTMLMetaElement;
        if (meta_el) {
            headers['fe-build-time'] = meta_el.dataset.buildTime!;
            headers['fe-filename'] = meta_el.dataset.filename!;
        }
    });
}

function tryIt(func: Function) {
    try {
        return func();
    } catch (e) {
        console.error(e);
    }
}
