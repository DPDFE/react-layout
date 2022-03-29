import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@dpdfe/react-layout/dist/style.css';
import '../index.css';

import { Draggable } from '@dpdfe/react-layout';
import { draggable_arg_types } from './args/draggable';
import { useRef, useState } from 'react';

export default {
    title: 'Draggable',
    component: Draggable,
    id: 'draggable',
    argTypes: draggable_arg_types
} as unknown as ComponentMeta<typeof Draggable>;

const Template: ComponentStory<typeof Draggable> = (args) => {
    const draggable_ref = useRef<HTMLDivElement>(null);
    const wrapper_ref = useRef<HTMLDivElement>(null);
    const [x, setX] = useState<number>(100);
    const [y, setY] = useState<number>(100);

    return (
        <div
            style={{
                width: '100%',
                height: '500px',
                border: '1px solid',
                position: 'relative'
            }}
            ref={wrapper_ref}
        >
            <Draggable
                {...args}
                x={x}
                y={y}
                use_css_transform={true}
                onDragStart={() => {
                    console.log('dragStart');
                }}
                onDrag={({ x, y }: { x: number; y: number }) => {
                    setX(x);
                    setY(y);
                }}
                onDragStop={() => {
                    console.log('onDrag');
                }}
            >
                <div
                    ref={draggable_ref}
                    style={{
                        width: 120,
                        height: 120,
                        background: 'red'
                    }}
                ></div>
            </Draggable>
        </div>
    );
};

export const draggable = Template.bind({});
draggable.args = {
    is_draggable: true,
    bound: {
        max_x: Infinity,
        min_x: 0,
        min_y: 0,
        max_y: 500 - 120
    }
};
