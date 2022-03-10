import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import DraggableLayout from './drag'


export default {
  title: 'example/drag',
  component: DraggableLayout,
  id: 'drag',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof DraggableLayout>;

const Template: ComponentStory<typeof DraggableLayout> = (args) => {
  return <DraggableLayout />
};

export const Static = Template.bind({});
Static.args = {
  primary: true,
  label: 'Button',
};

export const Responsive = Template.bind({});
Responsive.args = {
  label: 'Button',
};


