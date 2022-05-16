import { ItemPos, LayoutItem } from '@/interfaces';

class Droppable {
    id: string;
    is_droppable?: boolean;
    getRef: () => HTMLDivElement | null;
    getViewPortRef: () => HTMLDivElement | null;
    getCurrentLayout: () => LayoutItem[];
    deleteShadow: (widget: LayoutItem, is_save?: boolean) => void;
    addShadow: (widget: LayoutItem, is_save?: boolean) => void;
    move: (
        current_widget: LayoutItem,
        item_pos: ItemPos,
        is_save?: boolean
    ) => void;

    constructor({
        id,
        is_droppable = false,
        getRef,
        getViewPortRef,
        getCurrentLayout,
        deleteShadow,
        addShadow,
        move
    }: Droppable) {
        this.id = id;
        this.is_droppable = is_droppable;
        this.getRef = getRef;
        this.getViewPortRef = getViewPortRef;
        this.getCurrentLayout = getCurrentLayout;
        this.deleteShadow = deleteShadow;
        this.addShadow = addShadow;
        this.move = move;
    }
}

export default Droppable;
