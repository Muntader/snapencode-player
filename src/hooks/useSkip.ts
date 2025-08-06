import { usePlayerStateStore } from '../store/usePlayerStateStore';
import {usePlayerControls} from "@/hooks/usePlayerControls";

/**
 * Provides the state for the "skip" feature (e.g., skip intro).
 *
 * @returns An object containing the active skip interval (if any), a visibility boolean, and the action to perform the skip.
 */
export const useSkipState = () => {
    // Get the state needed to decide if the skip button should be visible
    const activeSkipInterval = usePlayerStateStore((state) => state.activeSkipInterval);

    // Get the action to perform the skip
    const { skip } = usePlayerControls();

    return {
        // A convenient boolean for UI components
        isSkipVisible: !!activeSkipInterval,
        // The action to trigger the skip
        skip,
        // The raw interval data, useful for displaying dynamic text like "Skip Intro" or "Skip Recap"
        interval: activeSkipInterval,
    };
};
