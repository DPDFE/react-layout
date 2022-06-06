import { ItemPos, LayoutItem } from '@/interfaces';

class Droppable {
    id: string;
    is_droppable?: boolean;
    getRef: () => HTMLDivElement | null;
    getViewPortRef: () => HTMLDivElement | null;
    getFilterLayoutById: (i: string) => LayoutItem[];
    deleteShadow: (widget?: LayoutItem) => LayoutItem[];
    addShadow: (widget: LayoutItem, is_save?: boolean) => any;
    move: (current_widget: LayoutItem, item_pos: ItemPos) => void;

    constructor({
        id,
        is_droppable = false,
        getRef,
        getViewPortRef,
        deleteShadow,
        getFilterLayoutById,
        addShadow,
        move
    }: Droppable) {
        this.id = id;
        this.is_droppable = is_droppable;
        this.getRef = getRef;
        this.getViewPortRef = getViewPortRef;
        this.deleteShadow = deleteShadow;
        this.getFilterLayoutById = getFilterLayoutById;
        this.addShadow = addShadow;
        this.move = move;
    }
}

export default Droppable;
