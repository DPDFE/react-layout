import {
    WidgetItemProps,
    LayoutMode,
    LayoutItemEntry,
    LayoutItemDescriptor,
    WidgetType
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

import { MIN_DRAG_LENGTH } from '../calc';
import Draggable, { DEFAULT_BOUND } from './draggable';
import Resizable from './resizable';
// vite在watch模式下检测style变化需要先将内容引进来才能监听到
import styles from './styles.module.css';
import './styles.module.css';
import { LayoutContext } from '../context';

const WidgetItem = React.forwardRef((props: WidgetItemProps, ref) => {
    const child = React.Children.only(props.children) as ReactElement;
    const item_ref = ref ?? useRef<HTMLDivElement>(null);

    const { col_width, row_height } = props.grid;

    const {
        i,
        w,
        h,
        x,
        y,
        type,
        is_dragging,
        is_draggable,
        is_resizable,
        need_mask,
        in_nested_layout,
        is_nested,
        layout_id,
        offset_x,
        offset_y,
        margin_height,
        margin_width,
        min_x,
        max_x,
        min_y,
        max_y
    } = props;

    const { registry } = useContext(LayoutContext);

    const is_float = type === WidgetType.drag;

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
        // onClick: (e: React.MouseEvent) => {
        //     e.stopPropagation();
        // },
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
                        ...{ x, y, h, w, i, type },
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
            styles['no-border']
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
                type,
                is_nested,
                is_resizable,
                is_draggable
            }
        }),
        [i, layout_id, x, y, w, h, type, is_nested, is_resizable, is_draggable]
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
    const published_ref = useRef<LayoutItemEntry>(entry);
    const is_first_publish_ref = useRef<boolean>(true);

    useEffect(() => {
        if (props.is_placeholder) return;
        registry.draggable.register(published_ref.current);
        return () => registry.draggable.unregister(published_ref.current);
    }, [registry.draggable]);

    useEffect(() => {
        if (props.is_placeholder) return;
        if (is_first_publish_ref.current) {
            is_first_publish_ref.current = false;
            return;
        }

        const last = published_ref.current;
        published_ref.current = entry;
        registry.draggable.update(entry, last);
    }, [entry, registry.draggable]);

    return (
        <React.Fragment>
            <Draggable
                {...{ x, y, h, w, i }}
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
                        type,
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
                        type,
                        i
                    });
                }}
            >
                <Resizable
                    ref={item_ref}
                    {...{ x, y, h, w, i, type }}
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
                            type,
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
                            type,
                            i
                        });
                    }}
                >
                    {new_child}
                </Resizable>
            </Draggable>
            {props.is_checked && !props.is_placeholder && (
                <div
                    className='checked_border'
                    style={{
                        position: 'absolute',
                        top: y,
                        left: x,
                        width: w,
                        height: h,
                        pointerEvents: 'none',
                        backgroundColor: 'transparent',
                        mixBlendMode: 'difference',
                        filter: 'invert(0)',
                        borderRadius: 5,
                        border: '1px dashed #fff' // #ed7116
                    }}
                ></div>
            )}
        </React.Fragment>
    );
});

WidgetItem.defaultProps = {
    scale: 1,
    type: WidgetType.grid,
    is_checked: false,
    is_placeholder: false,
    style: {},
    margin: [0, 0] as [number, number]
};

export default memo(WidgetItem, compareProps);

function compareProps<T>(prev: Readonly<T>, next: Readonly<T>): boolean {
    return !Object.keys(prev)
        .map((key) => {
            if (
                [
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
}

export function childrenEqual(a: ReactElement, b: ReactElement): boolean {
    return isEqual(
        React.Children.map(a, (c) => c?.key),
        React.Children.map(b, (c) => c?.key)
    );
}
