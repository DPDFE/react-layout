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

// @ts-ignore
window.global_local_storage = (window.global_local_storage ?? {}) as Record<
    string,
    any
>;

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
        /** 需要检查是否有key，而不是undefined判等 */
        // @ts-ignore
        if (!window.global_local_storage.hasOwnProperty(key)) {
            throw new Error(
                `未注册的 LocalStorage key：${key}。请先在 Storage 注册，统一管理。`
            );
        }
    };

    /** 获取值 */
    const getStorageItem = (key: string) => {
        try {
            const formatKey = getFormattedKey(key);
            const res = localStorage.getItem(formatKey);
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
            localStorage.setItem(formatKey, formatValue);
        } catch (e) {
            console.log(e);
        }
    };

    /** 删除值 */
    const removeStorageItem = (key: string) => {
        try {
            const formatKey = getFormattedKey(key);
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
                const target = last_item ?? storage[key] ?? undefined;

                /** 上次存储在localstorage中的默认值的优先级大于用户配置的默认值 */

                if (target) {
                    storage[key] = target;
                    setStorageItem(key, target);
                }

                /** 如果没有值就会进入默认值赋值流程，
                 * 所以在多配置单元的时候，
                 * 相关默认值只能有一个值，或者其他是undefined */

                //@ts-ignore
                if (!window.global_local_storage[key]) {
                    //@ts-ignore
                    window.global_local_storage[key] = target;
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
            return is_in_open_service_iframe
                ? // @ts-ignore
                  window.global_local_storage[key]
                : getStorageItem(key);
        },

        set: (target: typeof storage, key: string, value: any) => {
            ensureKeyRegistered(key);
            storage[key] = value;
            /** 处理iframe访问storage时，没有权限的情况 */
            if (is_in_open_service_iframe) {
                // @ts-ignore
                window.global_local_storage[key] = value;
            } else {
                setStorageItem(key, value);
            }
            return true;
        },

        deleteProperty(target: typeof storage, key: string): boolean {
            ensureKeyRegistered(key);
            /** 处理iframe访问storage时，没有权限的情况 */
            if (is_in_open_service_iframe) {
                // @ts-ignore
                delete window.global_local_storage[key];
            } else {
                removeStorageItem(key);
            }
            return getStorageItem(key) ? false : true;
        }
    });
};

/** expire local storage */
const expire_local_storage =
    // @ts-ignore
    (window.global_local_storage.expire_local_storage ?? {}) as Record<
        string,
        any
    >;

// @ts-ignore
window.global_local_storage.expire_local_storage = expire_local_storage;

// 设置携带过期时间的localStorage
export const ExpireLocalStorage = {
    setItem: function (key: string, value: any, expire: number) {
        const data = {
            value: value,
            expire: new Date().getTime() + expire
        };
        if (is_in_open_service_iframe) {
            expire_local_storage[key] = JSON.stringify(data);
        } else {
            localStorage.setItem(key, JSON.stringify(data));
        }
    },

    getItem: function (key: string) {
        const res = is_in_open_service_iframe
            ? expire_local_storage[key]
            : localStorage.getItem(key);
        if (res) {
            const data: { value: any; expire: number } = JSON.parse(res);
            // 如果没有超时的话
            if (data.expire > new Date().getTime()) {
                return data.value;
            }
        }

        return undefined;
    }
};

export default LocalStorage;
