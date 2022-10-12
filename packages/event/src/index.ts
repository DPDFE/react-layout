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
import { isHex, getKeywordColor, isRbg, isRgba } from './color/base';
import { darken, getOpacity, lighten } from './color';

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
    darken,
    lighten,
    getOpacity,
    isHex,
    isRbg,
    isRgba,
    getKeywordColor
};
