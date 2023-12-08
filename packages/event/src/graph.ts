/** Link规则 */
interface OriginLink {
    [key: string]: OriginGraphNodeType;
}

/** 所有Link key */
type OriginLinkKeys = keyof OriginLink;

/** 映射key */
interface OriginKey {
    start: OriginLinkKeys;
    end: OriginLinkKeys;
}

/** 节点类型 */
type OriginGraphNodeType = number | string;

const DEFAULT_START = 'start';
const DEFAULT_END = 'end';

/** 有向无环图 */
class DAG {
    /** 所有节点 */
    nodes: Set<OriginGraphNodeType> = new Set();

    /** 所有边child关系 */
    children: Map<OriginGraphNodeType, Set<OriginGraphNodeType>> = new Map();

    /** 所有边parents关系 */
    parents: Map<OriginGraphNodeType, Set<OriginGraphNodeType>> = new Map();

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
    fillLinks(
        links: OriginLink[],
        link_key: OriginKey = { start: DEFAULT_START, end: DEFAULT_END }
    ) {
        links.map((link) => {
            const start_key = link[link_key.start];
            const end_key = link[link_key.end];
            this.addLink(start_key, end_key);
        });
    }

    /** 删除节点 */
    removeNode(node: OriginGraphNodeType) {
        this.nodes.delete(node);
        this.children.delete(node);
        this.parents.delete(node);
    }

    /** 添加节点 */
    addNode(node: OriginGraphNodeType) {
        this.nodes.add(node);
        if (!this.children.get(node)) {
            this.children.set(node, new Set<OriginGraphNodeType>());
        }
        if (!this.parents.get(node)) {
            this.parents.set(node, new Set<OriginGraphNodeType>());
        }
    }

    /** 添加一条边 */
    addLink(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        this.addLinkChild(start, end);
        this.addLinkParent(start, end);
    }

    /** 添加一条边 */
    addLinkChild(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        const target = this.children.get(start);
        if (target && this.nodes.has(end)) {
            target.add(end);
        } else {
            console.error(`有未知节点: ${start} 或 ${end}`);
        }
    }

    /** 添加一条边 */
    addLinkParent(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        const target = this.parents.get(end);
        if (target && this.nodes.has(start)) {
            target.add(start);
        } else {
            console.error(`有未知节点: ${start} 或 ${end}`);
        }
    }

    /** 删除一条边 */
    removeLink(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        this.removeLinkChild(start, end);
        this.removeLinkParent(start, end);
    }

    /** 删除一条边 */
    removeLinkChild(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        const target = this.children.get(start);
        if (target && this.nodes.has(end)) {
            target.delete(end);
        } else {
            console.error(`有未知节点: ${start} 或 ${end}`);
        }
    }

    /** 删除一条边 */
    removeLinkParent(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        const target = this.parents.get(end);
        if (target && this.nodes.has(start)) {
            target.delete(start);
        } else {
            console.error(`有未知节点: ${start} 或 ${end}`);
        }
    }

    /** 清空 */
    clear() {
        this.nodes = new Set();
        this.children = new Map();
        this.parents = new Map();
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

        const children = this.children.get(node)!;

        for (const child of children.values()) {
            if (this.detectCycle(child, visited, stack)) {
                return true;
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

        const children = this.children.get(node)!;

        for (const parent of children.values()) {
            if (this.detectChild(parent, visited, stack)) {
                return true;
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

        const parents = this.parents.get(node)!;

        for (const parent of parents.values()) {
            if (this.detectParent(parent, visited, stack)) {
                return true;
            }
        }

        stack.delete(node);
        return;
    }
}

export default DAG;
