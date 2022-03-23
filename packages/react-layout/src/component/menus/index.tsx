import { MenuProps } from "@/interfaces";
import MenuItem from "./item";
import React, { memo, useRef } from "react";
import styles from "./styles.module.css";

/** 滚动时menu没有消失 */
const Menus = (props: MenuProps) => {
    const menu_ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={menu_ref} style={{...props.style}}>
            {props.children}
        </div>
    );
};

export default memo(Menus);
export { MenuItem };
