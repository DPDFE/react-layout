/** 这是一个生命周期Hooks
 *
 */

/** 状态枚举
 * 数据加载完成状态
 * 渲染完成状态
 * 更新完成
 * 销毁完成
 */

enum Status {
    Loading = 'loading',
    Loaded = 'loaded',
    Rendering = 'rendering',
    Rendered = 'rendered',
    UpdateStart = 'start_update',
    Updated = 'updated',
    Destroyed = 'destroyed'
}

export type LifeCycleHandler = (...args: any[]) => void;
/** 生命周期处理方法 */
export type LifeCycle = {
    [key: string]: LifeCycleHandler[];
};
