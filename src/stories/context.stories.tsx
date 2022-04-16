import React, { useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import '../index.css';

import {
    ReactLayout,
    ReactLayoutContext,
    WidgetType
} from '@dpdfe/react-layout';
import { layout } from './layout.stories';
import { context_arg_types } from './args/context';
import useWidgets from './args/hooks';

export default {
    title: 'Context',
    component: ReactLayoutContext,
    id: 'context',
    argTypes: context_arg_types
} as unknown as ComponentMeta<typeof ReactLayoutContext>;

const Template: ComponentStory<typeof ReactLayoutContext> = (args) => {
    const { widgets, context_props } = useWidgets();

    return (
        <div style={{ width: '100%', height: '500px' }}>
            <ReactLayoutContext {...context_props}>
                <ReactLayout {...layout.args}>
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

export const context = Template.bind({});
