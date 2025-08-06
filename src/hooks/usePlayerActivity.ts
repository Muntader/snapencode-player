// src/hooks/usePlayerActivity.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePlayerActivityProps {
    /** Whether the media is currently playing. */
    isPlaying: boolean;
    /** The duration in milliseconds to wait before hiding the controls. */
    hideDelay?: number;
}

/**
 * Manages the visibility of player controls based on user activity (mouse movement)
 * and playback state.
 *
 * @returns an object containing:
 *  - `areControlsVisible`: A boolean state indicating if controls should be shown.
 *  - `activityHandlers`: A set of event handlers to spread onto the player container.
 */
export const usePlayerActivity = ({ isPlaying, hideDelay = 3000 }: UsePlayerActivityProps) => {
    const [areControlsVisible, setAreControlsVisible] = useState(true);
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

    // A single, reliable function to show controls and reset the hide timer.
    const showControlsAndResetTimer = useCallback(() => {
        // First, clear any existing timer to prevent premature hiding.
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }
        // Make sure the controls are visible.
        setAreControlsVisible(true);

        // Only set a timer to hide the controls if the video is actually playing.
        // If paused, the controls should remain visible indefinitely.
        if (isPlaying) {
            hideTimerRef.current = setTimeout(() => {
                setAreControlsVisible(false);
            }, hideDelay);
        }
    }, [isPlaying, hideDelay]);

    // Effect to manage visibility when the `isPlaying` state changes.
    useEffect(() => {
        // When playback starts or stops, we always want to show the controls initially.
        showControlsAndResetTimer();

        // The cleanup function is crucial for when the hook unmounts.
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, [isPlaying, showControlsAndResetTimer]); // Dependency array is correct.

    // The event handlers to be attached to the player container.
    // This is a much cleaner approach than adding/removing event listeners manually.
    const activityHandlers = {
        onMouseMove: showControlsAndResetTimer,
        onMouseDown: showControlsAndResetTimer, // Also show on click/tap
        onMouseLeave: () => {
            // When the mouse leaves, start the hide timer immediately if playing.
            if (isPlaying) {
                hideTimerRef.current = setTimeout(() => setAreControlsVisible(false), hideDelay);
            }
        },
        // We can add touch events here as well for mobile support
        onTouchStart: showControlsAndResetTimer,
    };

    return { areControlsVisible, activityHandlers };
};
