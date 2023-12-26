/**
 * 类型定义
 */
interface ReloadSiteProps {
    /** 在黑名单中的url不要刷页面 */
    isInBlacklist?: (url?: string) => boolean;

    /** 检查网站是否有更新(调用后端接口检查，或者直接获取'/'拿到html与当前页面初始加载时获取的'/'进行比对)，若未传递，可设置一个默认方法 */
    hasNewVersion?: (
        old_html?: string,
        online_url?: string
    ) => Promise<boolean>;

    /** 可以通过获取html url是否发生变化来判断是否有新的代码上线 */
    online_url?: string;
}

/**
 * 当网页有新内容上线的时候，自动更新页面
 *
 * @param props - Props
 */
export default async function reloadSiteWhenRouteChange(
    props = {} as ReloadSiteProps
) {
    const {
        isInBlacklist = () => false,
        hasNewVersion = defaultHasNewVersion
    } = props;

    const old_html = await fetchHtml(props.online_url);

    let check_time = +new Date();

    /** 检查页面有更新后，此变量会变成true，下周期中，如果是true，直接刷新页面，实现网页更新 */
    let need_load = false;

    addRouteChangeListener();

    /**
     * 监听路由变化时，来检测页面是否有更新
     */
    function addRouteChangeListener() {
        const origin_pushState = window.history.pushState;
        const origin_replaceState = window.history.replaceState;
        const origin_hashChange = window.onhashchange;

        /**
         *重新history的pushState 和 replaceState方法
         * @param data - data
         * @param title - title
         * @param url - url
         */
        window.history.pushState = (data, title, url) => {
            origin_pushState.apply(window.history, [data, title, url]);
            reloadPageWhenUpdate();
        };

        window.history.replaceState = (data, title, url) => {
            origin_replaceState.apply(window.history, [data, title, url]);
            reloadPageWhenUpdate();
        };

        window.onhashchange = (event) => {
            origin_hashChange?.apply(window, [event]);
            reloadPageWhenUpdate();
        };
    }

    /**
     *如果网站有更新，reload page
     */
    async function reloadPageWhenUpdate() {
        if (need_load) {
            window.location.reload();
        }
        if (
            checkTime() &&
            !isInBlacklist(window.location.href) &&
            (await hasNewVersion(old_html, props.online_url))
        ) {
            need_load = true;
        }
    }

    /**
     * 超过1小时后检查页面是否有更新
     *
     * @returns
     */
    function checkTime() {
        const now = +new Date();
        const time_diff = now - check_time;
        if (time_diff > 1000 * 60 * 60) {
            check_time = +new Date();
            return true;
        }
        console.log('未超过1小时');
        return false;
    }
}

/**
 * 判断一下是否更新版本，默认通过对比html文件是否相等处理
 *
 * @param old_html - 旧版本的html
 * @param online_url -
 */
async function defaultHasNewVersion(old_html: string, online_url?: string) {
    try {
        const new_html = await fetchHtml(online_url);

        const res = old_html !== new_html;
        return res;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * 获取html
 *
 * @param online_url - html url
 */
async function fetchHtml(online_url?: string) {
    const res = await fetchWithTimeout(
        online_url ?? window.location.protocol + '//' + window.location.host
    );

    return res.text();
}

/**
 * 设置超过3600ms，终止fetch请求
 *
 * @param url - 请求参数
 * @param timeout - 超时时间
 * @returns
 */
async function fetchWithTimeout(url: string, timeout = 3600) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}
