/**
 * 一个版本管理工具
 * 场景一：版本有迭代逻辑，需要 v1 -> v2 -> v3 版本运行升级
 * 场景二：当大于某个版本的时候做什么事情
 * 场景三：当小于某个版本的时候不能做什么事情
 * 场景四：支持回退和重放
 **/

/** 版本管理的内容 */
export interface VersionContent {
    /** 当前版本信息 */
    action: string;
    /** 升级 */
    do: (() => Promise<void>) | (() => void);
    /** 重做 */
    undo?: () => void;
}

/** 事件状态 */
export enum StatusType {
    Success = 'success',
    Fail = 'fail'
}

/** 版本管理器 */
export default class VersionManager {
    versions: VersionContent[] = [];
    current_version = -1;

    constructor(versions?: VersionContent[]) {
        this.versions = versions ?? [];
    }

    /** 提交 */
    commit(content: VersionContent) {
        this.versions.push(content);
        return this;
    }

    /** 升级 */
    upgrade(target_version?: number) {
        if (!target_version) {
            target_version = this.versions.length - 1;
        }
        while (this.current_version < target_version) {
            this.do();
        }
    }

    do() {
        this.versions[this.current_version].do();
    }

    rollback() {
        this.versions[this.current_version].undo?.();
    }
}
