import { useEffect, useMemo } from 'react';
import createRegistry, { Registry } from './create';

export default function useRegistry(): Registry {
    const registry: Registry = useMemo(createRegistry, []);

    useEffect(() => {
        return function unmount() {
            requestAnimationFrame(registry.clean);
        };
    }, [registry]);

    return registry;
}
