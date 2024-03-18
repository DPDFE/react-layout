/**
 * @description 代理localstorage get、set方法
 * @using ` import {LocalStorage} from '@dpdfe/event-utils'
 *
 *    const storage = LocalStorage({username: 'zhangsan01'});
 *
 *    // 设置 localstorage
 *    >>> storage.account = {username: 'lisi02'}
 *
 *    // 获取 localstorage
 *    >>> const account = storage.account
 *
 *    // 删除 localstorage
 *    >>> delete storage.account`
 * @param storage 监听值
 * @param key_prefix 前缀
 * @returns
 */

/** iframe */
const is_in_open_service_iframe = window.parent !== window;

/** global local storage */
const global_local_storage = {} as Record<string, any>;

const LocalStorage = (
    storage: Record<string, any> = {},
    key_prefix: string = 'storage-'
) => {
    // 格式化 key，如添加前缀
    const getFormattedKey = (key: string): string => {
        return key_prefix + key;
    };

    // 检查 key 是不已经注册过，没注册过，则抛出异常
    const ensureKeyRegistered = (key: string): void => {
        if (!storage.hasOwnProperty(key)) {
            throw new Error(
                `未注册的 LocalStorage key：${key}。请先在 Storage 注册，统一管理。`
            );
        }
    };

    /** 获取值 */
    const getStorageItem = (key: string) => {
        try {
            const formatKey = getFormattedKey(key);
            const res = is_in_open_service_iframe
                ? global_local_storage[formatKey]
                : localStorage.getItem(formatKey);
            return res && res !== 'undefined' ? JSON.parse(res) : undefined;
        } catch (e) {
            console.log(e);
        }
    };

    /** 设置值 */
    const setStorageItem = (key: string, value: any) => {
        try {
            const formatKey = getFormattedKey(key);
            const formatValue = JSON.stringify(value);
            /** 处理iframe访问storage时，没有权限的情况 */
            if (is_in_open_service_iframe) {
                global_local_storage[formatKey] = formatValue;
            } else {
                localStorage.setItem(formatKey, formatValue);
            }
        } catch (e) {
            console.log(e);
        }
    };

    /** 删除值 */
    const removeStorageItem = (key: string) => {
        try {
            const formatKey = getFormattedKey(key);
            if (is_in_open_service_iframe) {
                delete global_local_storage[formatKey];
            }
            localStorage.removeItem(formatKey);
        } catch (e) {
            console.log(e);
        }
    };

    /** 初始化默认值 */
    const initStorage = () => {
        try {
            Object.keys(storage).map((key) => {
                const last_item = getStorageItem(key);
                if (last_item !== undefined) {
                    storage[key] = last_item;
                } else if (storage[key]) {
                    setStorageItem(key, storage[key]);
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    initStorage();

    // 注册所有 stroage 初始值
    return new Proxy<typeof storage>(storage, {
        get(target: typeof storage, key: string): any {
            ensureKeyRegistered(key);
            return getStorageItem(key) ?? storage[key];
        },

        set: (target: typeof storage, key: string, value: any) => {
            ensureKeyRegistered(key);
            storage[key] = value;
            setStorageItem(key, value);
            return true;
        },

        deleteProperty(target: typeof storage, key: string): boolean {
            ensureKeyRegistered(key);
            removeStorageItem(key);
            return getStorageItem(key) ? false : true;
        }
    });
};
export default LocalStorage;
