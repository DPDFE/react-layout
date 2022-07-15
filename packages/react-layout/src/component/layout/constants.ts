import { OperatorType } from '@/interfaces';

export const START_OPERATOR = [
    OperatorType.dropstart,
    OperatorType.dragstart,
    OperatorType.resizestart
];

export const CHANGE_OPERATOR = [
    OperatorType.drag,
    OperatorType.drop,
    OperatorType.resize
];

export const END_OPERATOR = [
    OperatorType.changeover,
    OperatorType.dropover,
    OperatorType.dragover,
    OperatorType.resizeover
];

export const DROP_OPERATOR = [
    OperatorType.dropstart,
    OperatorType.drop,
    OperatorType.dropover
];

export const DRAG_OPERATOR = [
    OperatorType.dragstart,
    OperatorType.drag,
    OperatorType.dragover
];

export const RESIZE_OPERATOR = [
    OperatorType.resizestart,
    OperatorType.resize,
    OperatorType.resizeover
];
