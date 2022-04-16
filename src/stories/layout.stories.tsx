import { ComponentStory, ComponentMeta } from '@storybook/react';

import '../index.css';
import {
    LayoutMode,
    LayoutType,
    ReactLayout,
    ReactLayoutContext,
    WidgetType
} from '@dpdfe/react-layout';
import { react_layout_arg_types } from './args/layout';
import useWidgets from './args/hooks';

export default {
    title: 'Layout',
    component: ReactLayout,
    id: 'layout',
    argTypes: react_layout_arg_types
} as unknown as ComponentMeta<typeof ReactLayout>;

const Template: ComponentStory<typeof ReactLayout> = (args) => {
    const { widgets, context_props } = useWidgets();

    return (
        <div style={{ width: '100%', height: '500px' }}>
            <ReactLayoutContext {...context_props}>
                <ReactLayout {...args}>
                    {widgets.map((w) => {
                        return (
                            <div
                                key={w.i}
                                data-drag={w}
                                style={{
                                    border: '1px solid',
                                    padding: 10,
                                    background:
                                        w.type === WidgetType.drag
                                            ? '#9eb3f1'
                                            : '#cddc39'
                                }}
                            >
                                i: {w.i} h: {w.h} w:{w.w} x:{w.x} y:{w.y}
                            </div>
                        );
                    })}
                </ReactLayout>
            </ReactLayoutContext>
        </div>
    );
};

export const layout = Template.bind({});
layout.story = { parameters: { canvas: { disable: true } } };
layout.args = {
    layout_type: LayoutType.DRAG,
    mode: LayoutMode.edit,
    need_ruler: true,
    layout_id: 'ROOT',
    height: 400,
    width: 1000,
    cols: 10,
    row_height: 20,
    container_padding: [10],
    item_margin: [10, 10],
    need_grid_bound: true,
    need_drag_bound: true,
    need_grid_lines: true,
    scale: 1,
    style: {
        backgroundColor: '#fff'
    }
    // guide_lines: [{ x: 0, y: 0, direction: 'horizontal' }],
    // addGuideLine: ({ x, y, direction }: RulerPointer) => void;
    // removeGuideLine: ({ x, y, direction }: RulerPointer) => void;
};
