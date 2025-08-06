// src/hooks/useInteraction.ts
import {useCallback, useEffect, useRef} from 'react';

type ClickHandler = () => void;
const CLICK_DELAY = 250; // ms

/**
 * A hook to distinguish between single and double clicks on an element.
 *
 * @param onSingleClick - The function to call on a single click.
 * @param onDoubleClick - The function to call on a double click.
 * @param delay - The maximum time in ms between clicks to be considered a double click.
 * @returns A single event handler function to be attached to the element's `onClick`.
 */
export const useInteraction = (
    onSingleClick: ClickHandler,
    onDoubleClick: ClickHandler,
    delay: number = CLICK_DELAY
) => {
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up the timeout when the component unmounts
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    return useCallback(() => {
        if (clickTimeoutRef.current) {
            // If a timeout is pending, it means this is the second click
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            onDoubleClick();
        } else {
            // Otherwise, it's the first click. Set a timeout.
            clickTimeoutRef.current = setTimeout(() => {
                onSingleClick();
                clickTimeoutRef.current = null;
            }, delay);
        }
    }, [onSingleClick, onDoubleClick, delay]);
};
