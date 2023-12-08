import { OriginGraphNodeType, OriginLink } from '.';

class Link {
    links: Map<
        OriginGraphNodeType,
        {
            target: Set<OriginGraphNodeType>;
            data: Record<OriginGraphNodeType, OriginLink>;
        }
    > = new Map();

    addNode(node: OriginGraphNodeType) {
        if (!this.links.get(node)) {
            this.links.set(node, {
                target: new Set<OriginGraphNodeType>(),
                data: {}
            });
        }
    }

    removeNode(node: OriginGraphNodeType) {
        this.links.delete(node);
    }

    addLink(
        start: OriginGraphNodeType,
        end: OriginGraphNodeType,
        data: OriginLink
    ) {
        const link = this.links.get(start);
        if (link && this.links.get(end)) {
            link.target.add(end);
            link.data[end] = data;
        } else {
            console.warn(`有未知节点: ${start} 或 ${end}`);
        }
    }
    removeLink(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        const link = this.links.get(start);
        if (link && this.links.get(end)) {
            link.target.delete(end);
        } else {
            console.warn(`有未知节点: ${start} 或 ${end}`);
        }
    }

    clear() {
        this.links = new Map();
    }
}

export default Link;
