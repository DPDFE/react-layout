export const resizable_arg_types = {
    children: {
        type: {
            type: 'ReactElement'
        },
        description: '子元素',
        defaultValue: undefined,
        table: {
            type: { summary: 'ReactElement' },
            defaultValue: {
                summary: `<div ref={'item_ref'} style={{width: 100, height: 100}}></div>`
            }
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
    h: {
        type: {
            type: 'number',
            required: true
        },
        control: { type: 'number' },
        description: '初始高度',
        defaultValue: 10,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 10 }
        }
    },
    w: {
        type: {
            type: 'number',
            required: true
        },
        control: { type: 'number' },
        description: '初始宽度',
        defaultValue: 10,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 10 }
        }
    },
    min_h: {
        type: {
            type: 'number'
        },
        control: { type: 'number' },
        description: '最小高度',
        defaultValue: 0,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: 10 }
        }
    },
    min_w: {
        type: {
            type: 'number'
        },
        control: { type: 'number' },
        description: '最小宽度',
        defaultValue: 0,
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
    use_css_fixed: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '需要position:fixed',
        defaultValue: false,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: false }
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
    is_resizable: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '是否可缩放',
        defaultValue: true,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: true }
        }
    },
    onResizeStart: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '开始缩放',
        table: {
            defaultValue: {
                summary: 'onResizeStart?: () => void;'
            }
        }
    },
    onResize: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '缩放中',
        table: {
            defaultValue: {
                summary:
                    'onResize?: ({x, y, h, w }: { x: number; y: number; h: number; w: number;}) => void;'
            }
        }
    },
    onResizeStop: {
        type: {
            type: 'function'
        },
        control: { type: null },
        description: '缩放结束',
        table: {
            defaultValue: {
                summary:
                    'onDragStop?: ({ x, y, h, w }: { x: number; y: number; h: number; w: number; }) => void;'
            }
        }
    }
};
