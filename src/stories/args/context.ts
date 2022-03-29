export const context_arg_types = {
    getDroppingItem: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '拖拽生成组件时，获取用户配置的新组件默认值。',
        table: {
            defaultValue: {
                summary:
                    'getDroppingItem?: () => { h: number; w: number; i: string };'
            }
        }
    },
    onDrop: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '放置到画布上时，生成新组件回调方法',
        defaultValue: {
            summary: 'onDrop?: (result: DropResult) => LayoutItem;'
        }
    },
    onDragStart: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '开始拖拽',
        defaultValue: {
            summary: 'onDragStart?: (start: DragStart) => void;'
        }
    },
    onDrag: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '拖拽中',
        defaultValue: {
            summary: 'onDrag?: (result: DragResult) => void;'
        }
    },
    onDragStop: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '拖拽结束',
        defaultValue: {
            summary: 'onDragStop?: (result: DragResult) => void;'
        }
    },
    onResizeStart: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '开始缩放',
        defaultValue: {
            summary: 'onResizeStart?: (start: DragStart) => void;'
        }
    },
    onResize: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '缩放中',
        defaultValue: {
            summary: 'onResize?: (start: DragStart) => void;'
        }
    },
    onResizeStop: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '缩放结束',
        defaultValue: {
            summary: 'onResizeStop?: (start: DragStart) => void;'
        }
    },
    onChange: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '缩放、拖拽、键盘事件全量变化触发',
        defaultValue: {
            summary: 'onChange?: (result: DragResult) => void;'
        }
    },
    onPositionChange: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '键盘更改浮动元素位置时触发',
        defaultValue: {
            summary: 'onPositionChange?: (start: DragStart) => void;'
        }
    }
};
