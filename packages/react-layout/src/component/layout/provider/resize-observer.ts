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
        let isMounted = true;
        let rafId: number;

        /**
         * 缩放容器触发器
         */
        const resizeObserverInstance = new ResizeObserver(() => {
            rafId = requestAnimationFrame(() => {
                if (isMounted) {
                    func();
                }
            });
        });

        const currentRef = ref.current;
        if (currentRef) {
            resizeObserverInstance.observe(currentRef);
        }

        return () => {
            isMounted = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            if (currentRef) {
                resizeObserverInstance.unobserve(currentRef);
            }
            resizeObserverInstance.disconnect();
        };
    }, []);
}
