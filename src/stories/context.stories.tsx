import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import '../index.css';

import { ReactLayoutContext } from '@dpdfe/react-layout';
import { context_arg_types } from './args/context';
import DefaultLayout from '../example/default';

export default {
    title: 'Context',
    component: ReactLayoutContext,
    id: 'context',
    argTypes: context_arg_types
} as unknown as ComponentMeta<typeof ReactLayoutContext>;

const Template: ComponentStory<typeof ReactLayoutContext> = (args) => {
    return (
        <div
            style={{
                width: '100%',
                height: '1000px',
                border: '1px solid'
            }}
        >
            <DefaultLayout></DefaultLayout>
        </div>
    );
};

export const context = Template.bind({});
