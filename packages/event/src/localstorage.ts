
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
const LocalStorage = (
    storage: Record<string, any> = {},
    key_prefix: string = 'storage-',
) => {
    // 格式化 key，如添加前缀
    const getFormattedKey = (key: string): string => {
        return key_prefix + key;
    };

    // 检查 key 是不已经注册过，没注册过，则抛出异常
    const ensureKeyRegistered = (key: string): void => {
        if (!storage.hasOwnProperty(key)) {
            throw new Error(
                `未注册的 LocalStorage key：${key}。请先在 Storage 注册，统一管理。`,
            );
        }
    };

    /** 获取值 */
    const getStorageItem = (key: string) => {
        const res = localStorage.getItem(getFormattedKey(key));
        return res && res !== 'undefined' ? JSON.parse(res) : undefined
    };

    /** 设置值 */
    const setStorageItem = (key: string, value: any) => {
        localStorage.setItem(getFormattedKey(key), JSON.stringify(value));
    }

    /** 删除值 */
    const removeStorageItem = (key: string) => {
        localStorage.removeItem(getFormattedKey(key));
    }

    /** 初始化默认值 */
    const initStorage = () => {
        Object.keys(storage).map((key) => {
            const last_item = getStorageItem(key)
            if (last_item) {
                storage[key] = last_item;
            } else {
                setStorageItem(key, storage[key]);
            }
        });
    };

    initStorage();

    // 注册所有 stroage 初始值
    return new Proxy<typeof storage>(storage, {
        get(target: typeof storage, key: string): any {
            ensureKeyRegistered(key);
            return storage[key];
        },

        set: (target: typeof storage, key: string, value: any) => {
            ensureKeyRegistered(key);
            storage[key] = value;
            setStorageItem(key, value)
            return true;
        },

        deleteProperty(target: typeof storage, key: string): boolean {
            ensureKeyRegistered(key);
            removeStorageItem(key);
            return getStorageItem(key) ? false : true;
        },
    });
};
export default LocalStorage;
