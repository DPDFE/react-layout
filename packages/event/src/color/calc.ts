import { getLuminance, toRgb } from '..';
import { formatFloatNumber } from '../data/format';
import { RGB, RGBFormatType, toRgba } from './torgba';

/** 灰度 */
export const gray = (color: string) => {
    return formatFloatNumber(
        getLuminance(
            toRgb(color, {
                format: RGBFormatType.Object
            }) as RGB
        ),
        2
    );
};

/** 获取灰度显示文本颜色 */
export const textColor = (color: string, gray_pointer = 0.45) => {
    if (gray(color) > gray_pointer) {
        return '#555555';
    } else {
        return '#fff';
    }
};

/** 透明度 */
export const opacity = (color: string, alpha = 0.6) => {
    return toRgba(color, { alpha: alpha });
};
