import { LayoutMode, LayoutType } from '@dpdfe/react-layout';

export const react_layout_arg_types = {
    layout_type: {
        type: {
            type: 'radio',
            required: true
        },
        control: { type: 'radio' },
        defaultValue: LayoutType.DRAG,
        description: '画布类型',
        options: [LayoutType.DRAG, LayoutType.GRID],
        table: {
            type: { summary: 'radio' },
            defaultValue: { summary: LayoutType.DRAG }
        }
    },
    mode: {
        type: {
            type: 'radio',
            required: true
        },
        control: { type: 'radio' },
        description: '画布状态',
        options: [LayoutMode.edit, LayoutMode.view],
        defaultValue: LayoutMode.edit,
        table: {
            type: { summary: 'radio' },
            defaultValue: { summary: LayoutMode.view }
        }
    },
    need_ruler: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '需要标尺',
        defaultValue: false,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: false }
        }
    },
    height: {
        type: {
            type: 'number',
            required: false
        },
        control: { type: 'number' },
        description: '画布高度',
        defaultValue: 400,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: '400px' }
        }
    },
    width: {
        type: {
            type: 'number',
            required: false
        },
        control: { type: 'number' },
        description: '画布宽度',
        defaultValue: 400,
        table: {
            type: { summary: 'number' },
            defaultValue: { summary: '400px' }
        }
    },
    cols: {
        description: '自适应水平总份数',
        control: 'number',
        defaultValue: 10,
        table: {
            defaultValue: { summary: 10 }
        }
    },
    row_height: {
        description: '自适应基础高度',
        control: 'number',
        table: {
            defaultValue: { summary: 20 }
        },
        defaultValue: 20
    },
    layout_id: {
        control: 'string',
        description: '布局名称'
    },
    container_padding: {
        control: 'array',
        description: '内边距大小',
        table: {
            type: { summary: '[number, number?, number?, number?]' },
            defaultValue: { summary: `[0]` }
        }
    },
    item_margin: {
        control: 'array',
        description: '栅栏元素外边距',
        table: {
            type: { summary: '[number, number]' },
            defaultValue: { summary: `[0, 0]` }
        }
    },
    need_grid_bound: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description:
            '所有栅栏元素边界控制，栅栏边界为上左右边界，可以向下延伸。',
        defaultValue: false,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: false }
        }
    },
    need_drag_bound: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '所有浮动元素边界控制，上下左右全量边界控制。',
        defaultValue: false,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: false }
        }
    },
    need_grid_lines: {
        type: {
            type: 'boolean',
            required: false
        },
        control: { type: 'boolean' },
        description: '网格线',
        defaultValue: false,
        table: {
            type: { summary: 'boolean' },
            defaultValue: { summary: false }
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
    // guide_lines: {
    //     type: {
    //         type: 'array',
    //         required: false
    //     },
    //     control: { type: 'array' },
    //     description: '支持增加水平垂直标准线。',
    //     defaultValue: [],
    //     table: {
    //         type: { summary: 'RulerPointer[]' },
    //         defaultValue: { summary: '[]' }
    //     }
    // },
    style: {
        type: { type: 'object' },
        control: {
            type: 'object',
            backgroundColor: {
                control: {
                    type: 'color'
                }
            }
        },
        description: '画布样式设置',
        defaultValue: { backgroundColor: '#fff' },
        table: {
            type: { summary: 'React.CSSProperties' },
            defaultValue: { summary: { backgroundColor: '#fff' } }
        }
    }
};
