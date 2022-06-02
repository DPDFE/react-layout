export const draggable_arg_types = {
    children: {
        type: {
            type: 'ReactElement'
        },
        description: '子元素',
        defaultValue: undefined,
        table: {
            type: { summary: 'ReactElement' },
            defaultValue: {
                summary: `<div ref={'draggable_ref'} style={{width: 100, height: 100}}></div>`
            }
        }
    },
    threshold: {
        type: {
            type: 'number',
            required: false
        },
        control: { type: 'number' },
        description: '移动多少距离后算拖拽开始',
        defaultValue: 5,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 5 }
        }
    },
    x: {
        type: {
            type: 'number',
            required: true
        },
        control: { type: 'number' },
        description: '拖拽初始x坐标',
        defaultValue: 10,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 10 }
        }
    },
    y: {
        type: {
            type: 'number',
            required: true
        },
        control: { type: 'number' },
        description: '拖拽初始y坐标',
        defaultValue: 10,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 10 }
        }
    },
    scale: {
        type: {
            type: 'number',
            required: false
        },
        control: { type: 'number', min: 0.2, max: 1 },
        description: '缩放，0到1之间。',
        defaultValue: 1,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 1 }
        }
    },
    bound: {
        type: {
            type: 'object',
            required: false
        },
        control: { type: 'object' },
        description: '可拖拽范围',
        defaultValue: {
            max_x: Infinity,
            max_y: Infinity,
            min_x: -Infinity,
            min_y: -Infinity
        },
        table: {
            type: {
                summary:
                    '{max_x: number; max_y: number; min_x: number; min_y:number;}'
            },
            defaultValue: {
                summary: `{max_x: Infinity, max_y: Infinity, min_x: -Infinity, min_y: -Infinity}`
            }
        }
    },
    is_draggable: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '是否可拖拽',
        defaultValue: true,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: true }
        }
    },
    use_css_transform: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '需要transform表示位置变化',
        defaultValue: true,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: true }
        }
    },
    draggable_cancel_handler: {
        type: {
            type: 'string',
            required: false
        },
        control: { type: 'string' },
        defaultValue: undefined,
        description: '不可拖拽的元素',
        table: {
            type: { summary: 'string' },
            defaultValue: { summary: '.draggable_cancel_handler' }
        }
    },
    draggable_handler: {
        type: {
            type: 'string',
            required: false
        },
        control: { type: 'string' },
        defaultValue: undefined,
        description: '可拖拽手柄',
        table: {
            type: { summary: 'string' },
            defaultValue: { summary: '.draggable_handler' }
        }
    },
    onDragStart: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '开始拖拽',
        table: {
            defaultValue: {
                summary: 'onDragStart?: () => void;'
            }
        }
    },
    onDrag: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '拖拽中',
        table: {
            defaultValue: {
                summary:
                    'onDrag?: ({ x, y }: { x: number; y: number }) => void;'
            }
        }
    },
    onDragStop: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '拖拽结束',
        table: {
            defaultValue: {
                summary:
                    'onDragStop?: ({ x, y }: { x: number; y: number }) => void;'
            }
        }
    }
};
