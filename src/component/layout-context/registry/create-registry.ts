import { LayoutEntry, LayoutItemEntry } from '@/interfaces';
type EntryMap = {
    draggables: { [id: string]: LayoutItemEntry };
    droppables: { [id: string]: LayoutEntry };
};

export default function createRegistry() {
    let root_droppable_id = '';
    const entries: EntryMap = {
        draggables: {},
        droppables: {}
    };

    function findDraggableById(id: string) {
        return entries.draggables[id] || null;
    }

    function getDraggableById(id: string): LayoutItemEntry {
        return findDraggableById(id);
    }

    const DraggableAPI = {
        register: (entry: LayoutItemEntry) => {
            if (entry.descriptor.is_placeholder) return;
            entries.draggables[entry.descriptor.id] = entry;
        },
        update: (entry: LayoutItemEntry, last: LayoutItemEntry) => {
            if (entry.descriptor.is_placeholder) return;
            const current = entries.draggables[last.descriptor.id];

            if (!current) {
                return;
            }

            if (current.unique_id !== entry.unique_id) {
                return;
            }

            delete entries.draggables[last.descriptor.id];
            entries.draggables[entry.descriptor.id] = entry;
        },
        unregister: (entry: LayoutItemEntry) => {
            if (entry.descriptor.is_placeholder) return;
            const string: string = entry.descriptor.id;
            const current = findDraggableById(string);

            if (!current) {
                return;
            }

            if (entry.unique_id !== current.unique_id) {
                return;
            }

            delete entries.draggables[string];
        },
        getById: getDraggableById,
        findById: findDraggableById,
        exists: (id: string): boolean => Boolean(findDraggableById(id))
    };

    function findDroppableById(id: string) {
        return entries.droppables[id] || null;
    }

    function getDroppableById(id: string): LayoutEntry {
        const entry = findDroppableById(id);
        return entry;
    }

    const DroppableAPI = {
        register: (entry: LayoutEntry) => {
            entries.droppables[entry.descriptor.id] = entry;
            entry.descriptor.is_root &&
                (root_droppable_id = entry.descriptor.id);
        },
        unregister: (entry: LayoutEntry) => {
            const current = findDroppableById(entry.descriptor.id);

            if (!current) {
                return;
            }

            if (entry.unique_id !== current.unique_id) {
                return;
            }

            entry.descriptor.is_root && (root_droppable_id = '');
            delete entries.droppables[entry.descriptor.id];
        },
        getById: getDroppableById,
        findById: findDroppableById,
        getRoot: () => entries.droppables[root_droppable_id],
        getAll: () => Object.values(entries.droppables),
        exists: (id: string): boolean => Boolean(findDroppableById(id))
    };

    function clean(): void {
        entries.draggables = {};
        entries.droppables = {};
    }

    return {
        draggable: DraggableAPI,
        droppable: DroppableAPI,
        clean
    };
}

export type Registry = ReturnType<typeof createRegistry>;
