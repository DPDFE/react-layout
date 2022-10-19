import {
    fomatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo
} from './utils';

import LocalStorage from './localstorage';

import Events from './eventbus';

import { toHex } from './color/tohex';
import {
    isHex,
    getKeywordColor,
    isRgb,
    isRgba,
    isHsl,
    isHsla
} from './color/base';
import { darken, lighten } from './color/computed';
import { toRgba, toRgb, getOpacity, getGrayLevel } from './color/torgba';
import { toHsl } from './color/tohsl';

export {
    Events,
    LocalStorage,
    fomatFloatNumber,
    addEvent,
    removeEvent,
    isFunction,
    matchesSelector,
    matchesSelectorAndParentsTo,
    //color
    isHex,
    isRgb,
    isRgba,
    isHsl,
    isHsla,
    getKeywordColor,
    toHex,
    toRgb,
    toRgba,
    toHsl,
    darken,
    lighten,
    getOpacity,
    getGrayLevel
};
