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
    toRgbaByCanvas
} from './color/torgba';

import { darken, lighten, range } from './color/computed';
import { genAutoId, genAutoIdInit, genAutoIdString } from './autoindex';

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
    toRgbaByCanvas,
    toRgba,
    toHsl,
    darken,
    lighten,
    range,
    getOpacity,
    getLuminance,
    getGrayLevel,
    // autoindext
    genAutoIdInit,
    genAutoId,
    genAutoIdString
};
