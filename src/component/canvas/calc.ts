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
