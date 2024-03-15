import { Position } from '@/interfaces';
import { addEvent, removeEvent } from '@dpdfe/event-utils';
import { useEffect, useMemo, useState } from 'react';

export function useScroll(target: any) {
    const [_position, setPosition] = useState<Position>();

    const position = useMemo(() => {
        return _position;
    }, [_position]);

    useEffect(() => {
        const updatePosition = () => {
            let newPosition: Position;
            if (target === document) {
                if (document.scrollingElement) {
                    newPosition = {
                        left: document.scrollingElement.scrollLeft,
                        top: document.scrollingElement.scrollTop
                    };
                } else {
                    newPosition = {
                        left: Math.max(
                            window.pageYOffset,
                            document.documentElement.scrollTop,
                            document.body.scrollTop
                        ),
                        top: Math.max(
                            window.pageXOffset,
                            document.documentElement.scrollLeft,
                            document.body.scrollLeft
                        )
                    };
                }
            } else {
                newPosition = {
                    left: (target as Element)?.scrollLeft,
                    top: (target as Element)?.scrollTop
                };
            }

            setPosition(newPosition);
        };

        // updatePosition();

        addEvent(target, 'scroll', updatePosition);
        return () => {
            removeEvent(target, 'scroll', updatePosition);
        };
    }, [target]);

    return position;
}
