import { useLayoutEffect, useState } from 'react';

export const useWindowResize = (
    container_ref: React.RefObject<HTMLDivElement>
) => {
    const [is_window_resize, setWindowResize] = useState<number>(Math.random());

    const resizeObserverInstance = new ResizeObserver(() => {
        setWindowResize(Math.random());
    });

    useLayoutEffect(() => {
        container_ref.current &&
            resizeObserverInstance.observe(container_ref.current);
        return () => {
            container_ref.current &&
                resizeObserverInstance.unobserve(container_ref.current);
        };
    }, [container_ref]);

    return is_window_resize;
};
