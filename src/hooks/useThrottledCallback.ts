// /hooks/useThrottledCallback.ts (or inside the same file if you prefer)
import { useCallback, useRef, useEffect } from 'react';

/**
 * Creates a throttled version of a callback that only invokes the function
 * at most once every `delay` milliseconds.
 *
 * @param callback The function to throttle.
 * @param delay The throttle delay in milliseconds.
 * @returns A memoized, throttled version of the callback.
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): T {
    const callbackRef = useRef(callback);
    const throttleRef = useRef<NodeJS.Timeout | null>(null);

    // Keep the latest callback in a ref
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args: Parameters<T>) => {
        if (!throttleRef.current) {
            callbackRef.current(...args);
            throttleRef.current = setTimeout(() => {
                throttleRef.current = null;
            }, delay);
        }
    }, [delay]) as T;
}
