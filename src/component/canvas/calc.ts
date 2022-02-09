import { LayoutItemProps, LayoutType } from '@/interfaces';

export function calcBoundBorder(
    bound?: [number, number?, number?, number?]
): [number, number, number, number] {
    if (bound) {
        switch (bound.length) {
            case 1:
                return [bound[0], bound[0], bound[0], bound[0]];
            case 2:
                return [
                    bound[0],
                    bound[1] as number,
                    bound[0],
                    bound[1] as number
                ];
            case 3:
                return [
                    bound[0],
                    bound[1] as number,
                    bound[2] as number,
                    bound[1] as number
                ];
            case 4:
                return [
                    bound[0],
                    bound[1] as number,
                    bound[2] as number,
                    bound[3] as number
                ];
        }
    }
    return [0, 0, 0, 0];
}

export function calcBoundStatus(
    props: LayoutItemProps,
    bound_border: [number, number, number, number],
    w: number,
    h: number,
    is_float?: boolean
): Partial<{
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
}> {
    const { layout_type, width, height } = props;
    if (layout_type === LayoutType.DRAG && is_float) {
        return {
            max_x: undefined,
            min_x: undefined,
            min_y: undefined,
            max_y: undefined
        };
    }

    return {
        max_x: width - w - bound_border[1],
        min_x: bound_border[3],
        min_y: bound_border[0],
        max_y: height - h - bound_border[2]
    };
}

export function calcBoundPositions(
    pos: { x: number; y: number },
    bound?: Partial<{
        min_x: number;
        max_x: number;
        min_y: number;
        max_y: number;
    }>
) {
    if (bound) {
        const { min_x, max_x, min_y, max_y } = bound;
        if (min_x != undefined && pos.x < min_x) {
            pos.x = min_x;
        }
        if (max_x != undefined && pos.x > max_x) {
            pos.x = max_x;
        }
        if (min_y != undefined && pos.y < min_y) {
            pos.y = min_y;
        }
        if (max_y != undefined && pos.y > max_y) {
            pos.y = max_y;
        }
    }
    return pos;
}

export function snapToGrid(
    pos: { delta_x: number; delta_y: number },
    grid?: [number, number]
) {
    if (grid) {
        const delta_grid_x = Math.round(pos.delta_x / grid[0]) * grid[0];
        const delta_grid_y = Math.round(pos.delta_y / grid[1]) * grid[1];
        return { delta_grid_x, delta_grid_y };
    }
    return { delta_grid_x: pos.delta_x, delta_grid_y: pos.delta_y };
}
