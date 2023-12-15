import Link from './link';

/** Link规则 */
export interface OriginLink {
    [key: string]: OriginGraphNodeType;
}

/** 所有Link key */
export type OriginLinkKeys = keyof OriginLink;

/** 映射key */
export interface OriginKey {
    start: OriginLinkKeys;
    end: OriginLinkKeys;
}

/** 节点类型 */
export type OriginGraphNodeType = number | string;

export const DEFAULT_START = 'start';
export const DEFAULT_END = 'end';

/** 有向无环图 */
class DAG {
    /** 所有节点 */
    nodes: Set<OriginGraphNodeType> = new Set();

    /** 所有关系 */
    links: OriginLink[] = [];

    link_key: OriginKey = { start: DEFAULT_START, end: DEFAULT_END };

    /** 所有边child关系 */
    private _children: Link = new Link();

    /** 所有边child关系 */
    get children() {
        return this._children.links;
    }

    /** 所有边parent关系 */
    private _parents: Link = new Link();

    get parents() {
        return this._parents.links;
    }

    /** 创建一个图 */
    constructor({
        nodes,
        links,
        link_key
    }: {
        nodes: OriginGraphNodeType[];
        links: OriginLink[];
        link_key: OriginKey;
    }) {
        this.init(nodes, links, link_key);
    }

    init(
        nodes: OriginGraphNodeType[],
        links: OriginLink[],
        link_key: OriginKey
    ) {
        this.fillNodes(nodes);
        this.fillLinks(links, link_key);
    }

    /** 填充node */
    fillNodes(nodes: OriginGraphNodeType[]) {
        this.nodes = new Set(nodes);

        const iterator = this.nodes.values();
        let result = iterator.next();
        while (!result.done) {
            this.addNode(result.value);
            result = iterator.next();
        }
    }

    /** 填充link */
    fillLinks(links: OriginLink[], link_key: OriginKey) {
        this.links = links;
        if (link_key) {
            this.link_key = link_key;
        }

        links.map((link) => {
            const start_key = link[this.link_key.start];
            const end_key = link[this.link_key.end];
            this.addLink(start_key, end_key, link);
        });
    }

    /** 删除节点 */
    removeNode(node: OriginGraphNodeType) {
        this.nodes.delete(node);
        this.links.map((link) => {
            const start_node = link[this.link_key.start];
            const end_node = link[this.link_key.end];
            if (start_node === node || end_node === node) {
                this.removeLink(start_node, end_node);
            }
        });
        this._children.removeNode(node);
        this._parents.removeNode(node);
    }

    /** 添加节点 */
    addNode(node: OriginGraphNodeType) {
        this.nodes.add(node);
        this._children.addNode(node);
        this._parents.addNode(node);
    }

    /** 添加一条边 */
    addLink(
        start: OriginGraphNodeType,
        end: OriginGraphNodeType,
        data: OriginLink
    ) {
        this._children.addLink(start, end, data);
        this._parents.addLink(end, start, data);
    }

    /** 删除一条边 */
    removeLink(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        console.log(start, end);
        this._children.removeLink(start, end);
        this._parents.removeLink(end, start);
    }

    /** 清空 */
    clear() {
        this.nodes = new Set();
        this._children.clear();
        this._parents.clear();
    }

    /** 验证全图成环 */
    hasCycle() {
        const visited: Set<OriginGraphNodeType> = new Set();
        const stack: Set<OriginGraphNodeType> = new Set();

        for (const node of this.nodes.values()) {
            if (this.detectCycle(node, visited, stack)) {
                return true;
            }
        }
        return false;
    }

    /** 验证单图环 */
    detectCycle(
        node: OriginGraphNodeType,
        visited: Set<OriginGraphNodeType>,
        stack: Set<OriginGraphNodeType>
    ) {
        if (stack.has(node)) {
            // 如果当前节点已经在递归栈中，则存在环
            return true;
        }
        if (visited.has(node)) {
            // 如果当前节点已经访问过，则不需要再继续探索
            return false;
        }

        visited.add(node);
        stack.add(node);

        const children = this._children.links.get(node);

        if (children) {
            for (const child of children.target.values()) {
                if (this.detectCycle(child, visited, stack)) {
                    return true;
                }
            }
        }

        stack.delete(node);
        return false;
    }

    /** 找到所有的子节点 */
    findChildren(
        node: OriginGraphNodeType,
        options: {
            /** 包含自己 */
            include_self: boolean;
        } = { include_self: true }
    ) {
        const children: Set<OriginGraphNodeType> = new Set();
        const stack: Set<OriginGraphNodeType> = new Set();

        this.detectChild(node, children, stack);
        if (!options.include_self) {
            children.delete(node);
        }
        return children;
    }

    /** 获取子元素 */
    detectChild(
        node: OriginGraphNodeType,
        visited: Set<OriginGraphNodeType>,
        stack: Set<OriginGraphNodeType>
    ) {
        if (stack.has(node)) {
            // 如果当前节点已经在递归栈中
            return;
        }
        if (visited.has(node)) {
            // 如果当前节点已经访问过，则不需要再继续探索
            return;
        }

        visited.add(node);
        stack.add(node);

        const children = this._children.links.get(node);

        if (children) {
            for (const parent of children.target.values()) {
                if (this.detectChild(parent, visited, stack)) {
                    return true;
                }
            }
        }

        stack.delete(node);
        return;
    }

    /** 找到所有的父节点 */
    findParents(
        node: OriginGraphNodeType,
        options: {
            /** 包含自己 */
            include_self: boolean;
        } = { include_self: true }
    ) {
        const parents: Set<OriginGraphNodeType> = new Set();
        const stack: Set<OriginGraphNodeType> = new Set();

        this.detectParent(node, parents, stack);
        if (!options.include_self) {
            parents.delete(node);
        }
        return parents;
    }

    /** 获取父元素 */
    detectParent(
        node: OriginGraphNodeType,
        visited: Set<OriginGraphNodeType>,
        stack: Set<OriginGraphNodeType>
    ) {
        if (stack.has(node)) {
            // 如果当前节点已经在递归栈中
            return;
        }
        if (visited.has(node)) {
            // 如果当前节点已经访问过，则不需要再继续探索
            return;
        }

        visited.add(node);
        stack.add(node);

        const parents = this._parents.links.get(node);

        if (parents) {
            for (const parent of parents.target.values()) {
                if (this.detectParent(parent, visited, stack)) {
                    return true;
                }
            }
        }

        stack.delete(node);
        return;
    }
}

export default DAG;
