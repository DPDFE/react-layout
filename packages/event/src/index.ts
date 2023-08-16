export {
    formatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo
} from './utils';

export { default as LocalStorage } from './localstorage';

export { default as Events } from './eventbus';

export { genAutoId, genAutoIdInit, genAutoIdString } from './autoindex';

export {
    isHex,
    isRgb,
    isRgba,
    isHsl,
    isHsla,
    getKeywordColor
} from './color/base';

export { toHex } from './color/tohex';

export { toHsl } from './color/tohsl';

export {
    toRgba,
    toRgb,
    getOpacity,
    getGrayLevel,
    getLuminance,
    toRgbaByCanvas
} from './color/torgba';

export { gray, textColor, opacity } from './color/calc';

export { darken, lighten, range } from './color/computed';
