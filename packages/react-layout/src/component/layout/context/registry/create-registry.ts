import { LayoutEntry, LayoutItemEntry } from '@/interfaces';
type EntryMap = {
    draggables: { [id: string]: LayoutItemEntry };
    droppables: { [id: string]: LayoutEntry };
};

export default function createRegistry() {
    let draggables_is_ready = false;

    const entries: EntryMap = {
        draggables: {},
        droppables: {}
    };

    function findDraggableById(id: string) {
        return entries.draggables[id] || null;
    }

    function getDraggableById(id: string): LayoutItemEntry {
        const entry = findDraggableById(id);
        return entry;
    }

    function registerDraggable(entry: LayoutItemEntry) {
        entries.draggables[entry.descriptor.id] = entry;

        if (!draggables_is_ready) {
            const is_all_ready = Object.keys(entries.draggables).map(
                (key) => entries.draggables[key].descriptor.is_ready
            );
            draggables_is_ready = !is_all_ready.includes(false);
        }
    }

    function unregisterDraggable(entry: LayoutItemEntry) {
        const current = findDraggableById(entry.descriptor.id);

        if (!current) {
            return;
        }

        if (entry.unique_id !== current.unique_id) {
            return;
        }

        delete entries.draggables[entry.descriptor.id];
    }

    const DraggableAPI = {
        register: registerDraggable,
        update: (entry: LayoutItemEntry, last: LayoutItemEntry) => {
            unregisterDraggable(last);
            registerDraggable(entry);
        },
        unregister: unregisterDraggable,
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
        },
        unregister: (entry: LayoutEntry) => {
            const current = findDroppableById(entry.descriptor.id);

            if (!current) {
                return;
            }

            if (entry.unique_id !== current.unique_id) {
                return;
            }

            delete entries.droppables[entry.descriptor.id];
        },
        getById: getDroppableById,
        findById: findDroppableById,
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
        draggables_is_ready,
        clean
    };
}

export type Registry = ReturnType<typeof createRegistry>;
