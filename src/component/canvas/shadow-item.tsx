import { ItemPos } from '@/interfaces';
import React, { Fragment, memo } from 'react';
import styles from './styles.module.css';

interface ShadowItemProps extends Partial<ItemPos> {}

function ShadowItem(props: ShadowItemProps) {
    console.log('render shadow ');
    const { x, y, w, h, is_float } = props;
    return (
        <Fragment>
            <div
                className={`placeholder ${styles.placeholder}`}
                style={{
                    transform: `translate(${x}px, ${y}px)`,
                    width: w,
                    height: h
                }}
            ></div>
        </Fragment>
    );
}

export default memo(ShadowItem);
