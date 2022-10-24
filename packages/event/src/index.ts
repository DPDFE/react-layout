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

import {
    isHex,
    isRgb,
    isRgba,
    isHsl,
    isHsla,
    getKeywordColor
} from './color/base';

import { toHex } from './color/tohex';

import { toHsl } from './color/tohsl';

import {
    toRgba,
    toRgb,
    getOpacity,
    getGrayLevel,
    getLuminance,
    _toRgba
} from './color/torgba';

import {
    brightness,
    luminance,
    darken,
    lighten,
    range
} from './color/computed';

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
    _toRgba,
    toRgba,
    toHsl,
    darken,
    lighten,
    brightness,
    luminance,
    range,
    getOpacity,
    getLuminance,
    getGrayLevel
};
