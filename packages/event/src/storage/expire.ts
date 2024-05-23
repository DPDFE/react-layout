/**
 * @description 代理ExpireLocalStorage get、set方法
 * @using ` import {ExpireLocalStorage} from '@dpdfe/event-utils'
 *
 *    const storage = ExpireLocalStorage({username: 'zhangsan01'});
 *
 *    // 设置 ExpireLocalStorage
 *    >>> storage.account = {username: 'lisi02'}
 *
 *    // 获取 ExpireLocalStorage
 *    >>> const account = storage.account
 *
 *    // 删除 ExpireLocalStorage
 *    >>> delete storage.account`
 * @param storage 监听值
 * @param key_prefix 前缀
 * @returns
 */

/** iframe */
const is_in_open_service_iframe = window.parent !== window;

/** expire local storage */
declare global {
    interface Window {
        expire_local_storage: Record<string, ExpireValue>;
    }
}

window.expire_local_storage = (window.expire_local_storage ?? {}) as Record<
    string,
    ExpireValue
>;

const ExpireLocalStorage = (
    storage: Record<string, ExpireValue> = {},
    key_prefix: string = 'storage-'
) => {
    // 格式化 key，如添加前缀
    const getFormattedKey = (key: string): string => {
        return key_prefix + key;
    };

    // 检查 key 是不已经注册过，没注册过，则抛出异常
    const ensureKeyRegistered = (key: string): void => {
        /** 需要检查是否有key，而不是undefined判等 */
        if (!window.expire_local_storage.hasOwnProperty(key)) {
            throw new Error(
                `未注册的 ExpireLocalStorage key：${key}。请先在 Storage 注册，统一管理。`
            );
        }
    };

    /** 获取值 */
    const getStorageItem = (storage: ExpireValue, key: string) => {
        try {
            const formatKey = getFormattedKey(key);

            const res = is_in_open_service_iframe
                ? window.global_local_storage[key]
                : localStorage.getItem(formatKey);

            if (storage.expire == null) {
                if (res != null && res !== 'undefined') {
                    return JSON.parse(res);
                } else {
                    return storage.init;
                }
            } else {
                if (storage.expire > new Date().getTime()) {
                    if (res != null && res !== 'undefined') {
                        return JSON.parse(res);
                    } else {
                        return storage.init;
                    }
                } else {
                    return storage.default;
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    /** 设置值 */
    const setStorageItem = (key: string, value: ExpireValue) => {
        try {
            if (value.expire == null) {
                setCurrentStorageItem(key, value.init);
            } else {
                if (value.expire > new Date().getTime()) {
                    setCurrentStorageItem(key, value.init);
                } else {
                    setCurrentStorageItem(key, value.default);
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    /** 直接赋值 */
    const setCurrentStorageItem = (key: string, value: any) => {
        try {
            const formatKey = getFormattedKey(key);
            const formatValue = JSON.stringify(value);

            /** 处理iframe访问storage时，没有权限的情况 */
            if (is_in_open_service_iframe) {
                window.global_local_storage[key] = value;
            } else {
                localStorage.setItem(formatKey, formatValue);
            }
        } catch (e) {
            console.log(e);
        }
    };

    /** 删除值 */
    const removeStorageItem = (target: typeof storage, key: string) => {
        delete target[key];
        try {
            const formatKey = getFormattedKey(key);
            /** 处理iframe访问storage时，没有权限的情况 */
            if (is_in_open_service_iframe) {
                delete window.global_local_storage[key];
            } else {
                localStorage.removeItem(formatKey);
            }
        } catch (e) {
            console.log(e);
        }
    };

    /** 初始化默认值 */
    const initStorage = () => {
        try {
            Object.keys(storage).map((key) => {
                const last_item = getStorageItem(storage[key], key);
                const target = last_item ?? undefined;

                /** 上次存储在localstorage中的默认值的优先级大于用户配置的默认值 */
                if (target != null) {
                    storage[key] = target;
                    setCurrentStorageItem(key, target);
                }

                /** 如果没有值就会进入默认值赋值流程，
                 * 所以在多配置单元的时候，
                 * 相关默认值只能有一个值，或者其他是undefined */

                if (!window.expire_local_storage[key]) {
                    window.expire_local_storage[key] = target;
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    initStorage();

    // 注册所有 storage 初始值
    return new Proxy<typeof storage>(storage, {
        get(target: typeof storage, key: string): any {
            ensureKeyRegistered(key);
            return getStorageItem(target[key], key);
        },

        set: (target: typeof storage, key: string, value: ExpireValue) => {
            ensureKeyRegistered(key);
            setStorageItem(key, value);
            storage[key] = value;
            return true;
        },

        deleteProperty(target: typeof storage, key: string): boolean {
            ensureKeyRegistered(key);
            removeStorageItem(target, key);
            return target[key] ? false : true;
        }
    });
};

export default ExpireLocalStorage;

export interface ExpireValue {
    // 初始值
    init?: any;
    // 如果过期返回默认值
    default?: any;
    // 过期时间
    expire?: number;
}
