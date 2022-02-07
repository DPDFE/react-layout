import { MenuProps } from '@/interfaces';
import MenuItem from './item';
import React, { memo, useRef } from 'react';
import styles from './styles.module.css';

/** 滚动时menu没有消失 */
const Menus = (props: MenuProps) => {
    const menu_ref = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.menus} ref={menu_ref}>
            {props.children}
        </div>
    );
};

export default memo(Menus);
export { MenuItem };
