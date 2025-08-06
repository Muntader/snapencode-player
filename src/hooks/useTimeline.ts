import { usePlayerStateStore } from '../store/usePlayerStateStore';
import {useShallow} from "zustand/react/shallow";
import {usePlayerControls} from "@/hooks/usePlayerControls";

/**
 * Provides state related to the player's timeline, such as current time,
 * duration, and live status. The `shallow` comparison prevents re-renders
 * unless one of these specific values changes.
 *
 * @returns An object with all necessary timeline data. The seek function is also included for convenience.
 */
export const useTimeline = () => {
    // Select all timeline-related state in a single, efficient subscription.
    const timelineState = usePlayerStateStore(
        useShallow((state) => ({
            currentTime: state.currentTime,
            duration: state.duration,
            isLive: state.isLive,
            isSeekable: state.isSeekable,
            seekRange: state.seekRange,
            isAdPlaying: state.isAdPlaying,
            isBuffering: state.isBuffering
        }))
    );
    // Get the seek action from the controls hook.
    const { seek } = usePlayerControls();

    return {
        ...timelineState,
        seek,
    };
};
