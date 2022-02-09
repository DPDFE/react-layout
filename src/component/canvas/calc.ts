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

export function snapToGrid(pos: { x: number; y: number }) {
    return pos;
}
