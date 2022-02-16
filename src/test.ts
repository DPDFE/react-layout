// const [operator_stack_pointer, setOperatorStackPointer] = useState<number>(-1);

// const [operator_stack, setOperatorStack] = useState<LayoutItem[][]>([]);

// export const MAX_STACK_LENGTH = -10; // 保存最大回撤操作距离
// /** 和当前选中元素有关 */
// const handleKeyDown = (e: React.KeyboardEvent) => {
//     /** 撤销还原 */
//     const positionChange = (idx: number) => {
//         setCurrentChecked(undefined);

//         const copy_layout = copyObjectArray(operator_stack[idx]);
//         (props as EditLayoutProps).onPositionChange?.(copy_layout);

//         setOperatorStackPointer(idx);

//         props.setFreshCount(props.fresh_count + 1);
//     };

//     if (e.keyCode === 90) {
//         if (e.shiftKey) {
//             // ctrl+shift+Z
//             if (operator_stack_pointer === operator_stack.length - 1) {
//                 return;
//             }
//             positionChange(operator_stack_pointer + 1);
//         } else {
//             // ctrl+Z
//             if (operator_stack_pointer === 0) {
//                 return;
//             }
//             positionChange(operator_stack_pointer - 1);
//         }
//     }
// };

// const pushPosStep = (layout?: LayoutItem[]) => {
//     if (!isEqual(layout, operator_stack[operator_stack_pointer])) {
//         const index = operator_stack_pointer + 1;
//         const copy_layout = operator_stack
//             .slice(0, index)
//             .slice(MAX_STACK_LENGTH)
//             .concat([copyObjectArray(layout!)]);
//         console.log('index', index, copy_layout);

//         setOperatorStack(copy_layout);
//         setOperatorStackPointer(index);
//         props.setFreshCount(props.fresh_count + 1);
//     }
// };
