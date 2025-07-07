import { usePlayerStateStore } from '../store/usePlayerStateStore';
import {usePlayerControls} from "@/player/hooks/usePlayerControls";

/**
 * Provides the current fullscreen status and the action to toggle it.
 *
 * @returns An object containing the `isFullscreenActive` boolean and the `toggleFullscreen` function.
 */
export const useFullscreenState = () => {
    // This hook subscribes to a single primitive value, so it's already highly optimized.
    const isFullscreenActive = usePlayerStateStore((state) => state.isFullscreenActive);

    // Get the corresponding action from the controls hook.
    const { toggleFullscreen } = usePlayerControls();

    return {
        isFullscreenActive,
        toggleFullscreen,
    };
};
