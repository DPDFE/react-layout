import { MenuItemProps } from "@/interfaces";
import React, { memo, useRef } from "react";
import styles from "./styles.module.css";

const MenuItem = (props: MenuItemProps) => {
    return (
        <div className={styles.menus} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

export default memo(MenuItem);
