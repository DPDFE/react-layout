import { Droppable, LayoutItemEntry } from '@/interfaces';

type EntryMap = {
    draggables: { [id: string]: LayoutItemEntry };
    droppables: { [id: string]: Droppable };
    droppable_sequence: string[];
};

export default function createRegistry() {
    const entries: EntryMap = {
        draggables: {},
        droppables: {}, // 所有的布局
        droppable_sequence: [] // 布局构建的顺序
    };

    function getDraggableById(id: string): LayoutItemEntry {
        return entries.draggables[id] || null;
    }

    function getDraggableByLayoutId(layout_id: string): LayoutItemEntry[] {
        return Object.values(entries.draggables).filter(
            (entry) => entry.descriptor.layout_id === layout_id
        );
    }

    function registerDraggable(entry: LayoutItemEntry) {
        entries.draggables[entry.descriptor.id] = entry;
    }

    function unregisterDraggable(entry: LayoutItemEntry) {
        const current = getDraggableById(entry.descriptor.id);

        if (!current) {
            return;
        }

        delete entries.draggables[entry.descriptor.id];
    }

    function getDroppableById(id: string) {
        return entries.droppables[id] || null;
    }

    function registerDroppable(entry: Droppable) {
        entries.droppables[entry.id] = entry;
        if (!entries.droppable_sequence.includes(entry.id)) {
            entries.droppable_sequence.push(entry.id);
        }
    }

    function unregisterDroppable(entry: Droppable) {
        const current = getDroppableById(entry.id);
        if (!current) {
            return;
        }

        delete entries.droppables[entry.id];
    }

    const clean = () => {
        entries.draggables = {};
        entries.droppables = {};
        entries.droppable_sequence = [];
    };

    return {
        clean,
        draggable: {
            register: registerDraggable,
            update: (entry: LayoutItemEntry, last: LayoutItemEntry) => {
                unregisterDraggable(last);
                registerDraggable(entry);
            },
            unregister: unregisterDraggable,
            getById: getDraggableById,
            getByLayoutId: getDraggableByLayoutId,
            exists: (id: string): boolean => Boolean(getDraggableById(id))
        },
        droppable: {
            register: registerDroppable,
            unregister: unregisterDroppable,
            getById: getDroppableById,
            getAll: () => {
                return entries.droppable_sequence.map((seq) => {
                    return entries.droppables[seq];
                });
            },
            getFirstRegister: () => {
                return entries.droppables[entries.droppable_sequence[0]];
            },
            exists: (id: string): boolean => Boolean(getDroppableById(id))
        }
    };
}

export type Registry = ReturnType<typeof createRegistry>;
