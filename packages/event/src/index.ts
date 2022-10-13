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
import { isHex, getKeywordColor, isRgb, isRgba } from './color/base';
import { darken, getOpacity, lighten } from './color';
import { toRgba } from './color/torgba';

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
    toHex,
    toRgba,
    darken,
    lighten,
    getOpacity,
    isHex,
    isRgb,
    isRgba,
    getKeywordColor
};
