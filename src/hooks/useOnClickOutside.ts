import { RefObject, useEffect } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: (event: AnyEvent) => void,
    // Add an optional ref for the button that triggers the element
    triggerRef?: RefObject<HTMLElement>
) {
    useEffect(() => {
        const listener = (event: AnyEvent) => {
            const targetElement = ref.current;
            const triggerElement = triggerRef?.current;

            // Do nothing if the click is on the main element or the trigger element
            if (
                !targetElement ||
                targetElement.contains(event.target as Node) ||
                (triggerElement && triggerElement.contains(event.target as Node))
            ) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, triggerRef]); // Add triggerRef to the dependency array
}
