import { useLayoutEffect } from 'react';

/**
 * resize observer
 * @param ref
 * @param func
 */
export function resizeObserver(
    ref: React.RefObject<HTMLDivElement>,
    func: () => void
) {
    useLayoutEffect(() => {
        /**
         * 缩放容器触发器
         */
        const resizeObserverInstance = new ResizeObserver(() => {
            requestAnimationFrame(func);
        });

        if (ref.current) {
            resizeObserverInstance.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                resizeObserverInstance.unobserve(ref.current);
                resizeObserverInstance.disconnect();
            }
        };
    }, []);
}
