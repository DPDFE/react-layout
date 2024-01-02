class Link<P, T> {
    links: Map<P, Map<P, T>> = new Map();

    addNode(node: P) {
        if (!this.links.get(node)) {
            this.links.set(node, new Map());
        }
    }

    removeNode(node: P) {
        this.links.delete(node);
    }

    addLink(start: P, end: P, data: T) {
        const start_link = this.links.get(start);
        const end_link = this.links.get(end);
        if (start_link && end_link) {
            start_link.set(end, data);
        } else {
            console.warn(`有未知节点: ${start} 或 ${end}`);
        }
    }
    removeLink(start: P, end: P) {
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
