import { ComponentStory, ComponentMeta } from '@storybook/react';
import '@dpdfe/react-layout/dist/index.css';
import '../index.css';

import { Resizable } from '@dpdfe/react-layout';
import { useRef, useState } from 'react';

export default {
    title: 'Resizable_and_draggable',
    component: Resizable,
    id: 'resizable_and_draggable'
} as unknown as ComponentMeta<typeof Resizable>;

const Template: ComponentStory<typeof Resizable> = (args) => {
    const item_ref = useRef<HTMLDivElement>(null);
    const [x, setX] = useState<number>(100);
    const [y, setY] = useState<number>(100);
    const [h, setH] = useState<number>(100);
    const [w, setW] = useState<number>(100);

    return (
        <div
            style={{
                width: '100%',
                height: '500px',
                border: '1px solid'
            }}
        >
            <Resizable
                {...args}
                x={x}
                y={y}
                w={w}
                h={h}
                onResizeStart={() => {
                    console.log('resizeStart');
                }}
                onResize={({
                    x,
                    y,
                    h,
                    w
                }: {
                    x: number;
                    y: number;
                    h: number;
                    w: number;
                }) => {
                    // args.onResize({ x, y, h, w });
                    setX(x);
                    setY(y);
                    setH(h);
                    setW(w);
                }}
                onResizeStop={() => {
                    console.log('resizeStop');
                }}
            >
                <div
                    ref={item_ref}
                    style={{
                        background: '#fff',
                        border: '1px solid',
                        overflow: 'hidden'
                    }}
                >
                    x:{x} y:{y} w:{w} h:{h}
                </div>
            </Resizable>
        </div>
    );
};

const resizable_and_draggable = Template.bind({});

resizable_and_draggable.args = {
    is_resizable: true,
    min_h: 10,
    min_w: 10,
    bound: {
        max_x: Infinity,
        min_x: 0,
        min_y: 0,
        max_y: 500
    }
};
