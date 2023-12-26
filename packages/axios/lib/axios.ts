/**
 * 这是axios的cancel服务，
 * 支持自定义cancel策略
 * 默认支持两个策略
 *
 * 当发送重复请求时候，且上一条请求还未完成，可取消上一次的请求。（CANCEL_LAST_AT_MOST_ONCE）
 * 当发送重复请求时候，且上一条请求还未完成，可不发送本次请求。（CANCEL_CURRENT_AT_MOST_ONCE）
 * 当路由切换时，可取消上一个页面的所有请求。（cancelReqs）
 *
 * export enum AjaxStrategy {
    CANCEL_LAST_AT_MOST_ONCE = 'cancel_last_at_most_once',
    CANCEL_CURRENT_AT_MOST_ONCE = 'cancel_current_at_most_once',
}
 */

module.exports = axios;

function axios() {
    // TODO
}
