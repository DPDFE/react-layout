import {
    WidgetItemProps,
    LayoutMode,
    LayoutItemEntry,
    LayoutItemDescriptor
} from '@/interfaces';
import isEqual from 'lodash.isequal';
import React, {
    memo,
    ReactElement,
    useContext,
    useRef,
    useCallback,
    useMemo,
    useEffect
} from 'react';

import { MIN_DRAG_LENGTH, snapToDragBound } from '../calc';
import Draggable, { clamp, DEFAULT_BOUND } from './draggable';
import Resizable from './resizable';
import styles from './styles.module.css';
import { LayoutContext } from '../context';

const WidgetItem = React.forwardRef((props: WidgetItemProps, ref) => {
    const child = React.Children.only(props.children) as ReactElement;
    const item_ref = ref ?? useRef<HTMLDivElement>(null);

    const { col_width, row_height } = props.grid;

    const {
        i,
        is_float,
        is_dragging,
        is_draggable,
        is_resizable,
        need_mask,
        in_nested_layout,
        is_nested,
        layout_id
    } = props;

    const { min_x, max_x, min_y, max_y } = snapToDragBound(
        props.bound,
        props.grid,
        is_float
    );

    const gridX = (count: number) => {
        return is_float || is_dragging ? count : count * col_width;
    };
    const gridY = (count: number) => {
        return is_float || is_dragging ? count : count * row_height;
    };

    const margin_height = is_float ? 0 : props.margin[0];
    const margin_width = is_float ? 0 : props.margin[1];

    const offset_x = is_float ? 0 : Math.max(margin_width, props.padding.left);
    const offset_y = is_float ? 0 : Math.max(margin_height, props.padding.top);

    const w = Math.max(gridX(props.w) - margin_width, 0);
    const h = Math.max(gridY(props.h) - margin_height, 0);

    const x = clamp(gridX(props.x) + offset_x, min_x, max_x - w);
    const y = clamp(gridY(props.y) + offset_y, min_y, max_y - h);

    /** 和当前选中元素有关 */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const keycode_step = 3;

        switch (e.keyCode) {
            case 37: // ArrowLeft
                return {
                    x: x - keycode_step
                };

            case 38: // ArrowUp
                return {
                    y: y - keycode_step
                };

            case 39: // ArrowRight
                return {
                    x: x + keycode_step
                };

            case 40: // ArrowDown
                return {
                    y: y + keycode_step
                };
        }
        return undefined;
    };

    // 如果child是一个iframe，就是一个黑洞，用遮罩把黑洞填上
    const mask_dom = (
        <div
            key={'mask'}
            className={`react-drag-item-mask`}
            style={{
                border: 'none',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        ></div>
    );

    const new_child = React.cloneElement(child, {
        tabIndex: i,
        onMouseDown: () => {
            props.setCurrentChecked?.(i);
        },
        onMouseOver: (e: React.MouseEvent) => {
            e.preventDefault();
        },
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        onDragLeave: (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        onDragEnter: (e: React.MouseEvent) => {
            e.stopPropagation();
        },
        onKeyDown: (e: React.KeyboardEvent) => {
            if (is_float) {
                const keydown_pos = handleKeyDown(e);
                if (keydown_pos) {
                    props.onPositionChange?.({
                        ...{ x, y, h, w, i, is_float },
                        ...keydown_pos
                    });
                }
            }
        },
        ref: item_ref,
        id: `${
            child.props.id
                ? child.props.id + ' layout_item_' + i
                : 'layout_item_' + i
        }`,
        className: `${[
            child.props.className,
            styles.layout_item,
            props.is_checked
                ? styles['light-theme-border']
                : styles['no-border']
        ].join(' ')}`,
        style: {
            transition: props.is_checked ? 'none' : 'all 0.1s linear',
            width: w,
            height: h,
            ...child.props.style,
            pointerEvents: is_dragging || props.is_placeholder ? 'none' : 'auto'
        },
        children:
            props.mode === LayoutMode.edit && need_mask
                ? [child.props.children, mask_dom]
                : child.props.children
    });

    /**
     * 获取模块最小范围
     */
    const getCurrentGrid = () => {
        if (is_float) {
            return {
                col_width: props.min_w ?? MIN_DRAG_LENGTH,
                row_height: props.min_h ?? MIN_DRAG_LENGTH
            };
        } else {
            return {
                col_width: (props.min_w ?? 1) * col_width,
                row_height: (props.min_h ?? 1) * row_height
            };
        }
    };

    const { registry } = useContext(LayoutContext);

    const unique_id = useMemo(() => {
        return `layout_item_${i}`;
    }, []);

    const descriptor: LayoutItemDescriptor = useMemo(
        () => ({
            id: i,
            layout_id,
            pos: {
                i,
                x,
                y,
                w,
                h,
                is_float,
                is_nested,
                is_resizable,
                is_draggable
            }
        }),
        [
            i,
            layout_id,
            x,
            y,
            w,
            h,
            is_float,
            is_nested,
            is_resizable,
            is_draggable
        ]
    );

    const getLayoutItemRef = useCallback((): HTMLElement | null => {
        if (item_ref instanceof Function) {
            return null;
        }
        return item_ref.current as HTMLElement;
    }, []);

    const entry: LayoutItemEntry = useMemo(
        () => ({
            descriptor,
            unique_id,
            getRef: getLayoutItemRef
        }),
        [descriptor, getLayoutItemRef, unique_id]
    );
    const publishedRef = useRef<LayoutItemEntry>(entry);
    const isFirstPublishRef = useRef<boolean>(true);

    useEffect(() => {
        if (props.is_placeholder) return;
        registry.draggable.register(publishedRef.current);
        return () => registry.draggable.unregister(publishedRef.current);
    }, [registry.draggable]);

    useEffect(() => {
        if (props.is_placeholder) return;
        if (isFirstPublishRef.current) {
            isFirstPublishRef.current = false;
            return;
        }

        const last = publishedRef.current;
        publishedRef.current = entry;
        registry.draggable.update(entry, last);
    }, [entry, registry.draggable]);

    return (
        <Draggable
            {...{ x, y, h, w, i, is_float }}
            threshold={5}
            use_css_transform={is_nested}
            scale={props.scale}
            is_draggable={is_draggable}
            onDragStart={() => {
                props.onDragStart?.();
            }}
            draggable_cancel={props.draggable_cancel}
            bound={
                in_nested_layout
                    ? DEFAULT_BOUND
                    : {
                          max_y: max_y - h,
                          min_y,
                          max_x: max_x - w,
                          min_x
                      }
            }
            onDrag={({ x, y }) => {
                const item = {
                    x: x - offset_x,
                    y: y - offset_y,
                    w: w + margin_width,
                    h: h + margin_height,
                    is_float,
                    i
                };
                props.onDrag?.(item);
            }}
            onDragStop={({ x, y }) => {
                props.onDragStop?.({
                    x: x - offset_x,
                    y: y - offset_y,
                    w: w + margin_width,
                    h: h + margin_height,
                    is_float,
                    i
                });
            }}
        >
            <Resizable
                ref={item_ref}
                {...{ x, y, h, w, i, is_float }}
                scale={props.scale}
                is_resizable={is_resizable}
                onResizeStart={() => {
                    props.onResizeStart?.();
                }}
                onResize={({ x, y, h, w }) => {
                    props.onResize?.({
                        x: x - offset_x,
                        y: y - offset_y,
                        w: w + margin_width,
                        h: h + margin_height,
                        is_float,
                        i
                    });
                }}
                grid={getCurrentGrid()}
                bound={{ max_x, max_y, min_x, min_y }}
                onResizeStop={({ x, y, h, w }) => {
                    props.onResizeStop?.({
                        x: x - offset_x,
                        y: y - offset_y,
                        w: w + margin_width,
                        h: h + margin_height,
                        is_float,
                        i
                    });
                }}
            >
                {new_child}
            </Resizable>
        </Draggable>
    );
});

WidgetItem.defaultProps = {
    scale: 1,
    is_float: false,
    is_checked: false,
    is_placeholder: false,
    style: {},
    margin: [0, 0] as [number, number]
};

export default memo(WidgetItem, compareProps);

function compareProps<T>(prev: Readonly<T>, next: Readonly<T>): boolean {
    const render_flag = !Object.keys(prev)
        .map((key) => {
            if (
                [
                    'is_dragging',
                    'data-drag',
                    'setCurrentChecked',
                    'onDragStart',
                    'onDrag',
                    'onDragStop',
                    'onResizeStart',
                    'onResize',
                    'onResizeStop',
                    'onPositionChange'
                ].includes(key)
            ) {
                return true;
            } else {
                return isEqual(prev[key], next[key]);
            }
        })
        .some((state) => state === false);
    return render_flag;
}

export function childrenEqual(a: ReactElement, b: ReactElement): boolean {
    return isEqual(
        React.Children.map(a, (c) => c?.key),
        React.Children.map(b, (c) => c?.key)
    );
}
