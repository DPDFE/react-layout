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
import { darken, lighten } from './color/computed';
import { toRgba, toRgb, getOpacity, getGrayLevel } from './color/torgba';

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
    getKeywordColor,
    toHex,
    toRgb,
    toRgba,
    darken,
    lighten,
    getOpacity,
    getGrayLevel
};
