import { OriginGraphNodeType, OriginLink } from '.';

class Link {
    links: Map<OriginGraphNodeType, Map<OriginGraphNodeType, OriginLink>> =
        new Map();

    addNode(node: OriginGraphNodeType) {
        if (!this.links.get(node)) {
            this.links.set(node, new Map());
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
        const start_link = this.links.get(start);
        const end_link = this.links.get(end);
        if (start_link && end_link) {
            start_link.set(end, data);
        } else {
            console.warn(`有未知节点: ${start} 或 ${end}`);
        }
    }
    removeLink(start: OriginGraphNodeType, end: OriginGraphNodeType) {
        const start_link = this.links.get(start);
        const end_link = this.links.get(end);
        if (start_link && end_link) {
            start_link.delete(end);
        } else {
            console.warn(`有未知节点: ${start} 或 ${end}`);
        }
    }

    clear() {
        this.links = new Map();
    }
}

export default Link;
