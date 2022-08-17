import { addEvent, removeEvent } from '@dpdfe/event-utils';
import { useEffect, useState } from 'react';

interface Position {
    top: number;
    left: number;
}

export function useScroll(target: any) {
    const [position, setPosition] = useState<Position>();

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
                    left: (target as Element).scrollLeft,
                    top: (target as Element).scrollTop
                };
            }

            setPosition(newPosition);
        };

        updatePosition();

        addEvent(target, 'scroll', updatePosition);
        return () => {
            removeEvent(target, 'scroll', updatePosition);
        };
    }, []);

    return position;
}
