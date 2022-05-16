import { OperatorType } from '@/interfaces';

export const START_OPERATOR = [
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
