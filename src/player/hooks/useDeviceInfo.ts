import { useState, useEffect } from 'react';

/**
 * A low-level hook to check if a CSS media query matches.
 * It listens for changes and updates the component when the match state changes.
 * This is the building block for more complex responsive hooks.
 *
 * @param query The CSS media query string to watch (e.g., '(min-width: 768px)').
 * @returns `true` if the media query currently matches, `false` otherwise.
 */
export function useMediaQuery(query: string): boolean {
    // State to hold the match status. Initialize with a function to check
    // only on the client-side, avoiding SSR issues with `window`.
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        // Again, ensure this only runs on the client.
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQueryList = window.matchMedia(query);

        // Define the listener function to update state
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Attach the listener
        // The 'change' event is more performant than using the deprecated `addListener`.
        mediaQueryList.addEventListener('change', listener);

        // Cleanup function to remove the listener when the component unmounts
        return () => {
            mediaQueryList.removeEventListener('change', listener);
        };
    }, [query]); // Re-run the effect only if the query string changes

    return matches;
}


/**
 * A high-level hook that provides convenient boolean flags about the current device
 * environment, such as screen size and orientation. It is built on top of `useMediaQuery`.
 *
 * @returns An object with boolean flags:
 * - `isDesktop`: True for screen widths >= 768px.
 * - `isMobile`: True for screen widths < 768px.
 * - `isLandscape`: True if the device orientation is landscape.
 * - `isMobilePortrait`: A convenient combination for portrait mobile views.
 * - `isMobileLandscape`: A convenient combination for landscape mobile views.
 */
export const useDeviceInfo = () => {
    // Define our breakpoints and orientation queries
    const isDesktop = useMediaQuery('(min-width: 768px)'); // Corresponds to Tailwind's `md` breakpoint
    const isLandscape = useMediaQuery('(orientation: landscape)');

    // Derive composite states from the primitive ones
    const isMobile = !isDesktop;
    const isMobilePortrait = isMobile && !isLandscape;
    const isMobileLandscape = isMobile && isLandscape;

    // Return a structured object for easy consumption in components
    return {
        isDesktop,
        isMobile,
        isLandscape,
        isMobilePortrait,
        isMobileLandscape,
    };
};
