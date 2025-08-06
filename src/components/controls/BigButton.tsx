import React from "react";
import {usePlayerControls} from "@/hooks/usePlayerControls";
import {cn} from "@/utils/cn";
import { Icons } from "../common/Icon";
interface BigButtonProps {
    /** Determines if the button should be visible and interactive. */
    isVisible: boolean;
    /** Determines which icon (Play or Pause) to display. */
    isPlaying: boolean;
    /** Optional additional class names to apply to the button. */
    className?: string;
}

/**
 * A large, stylish Play/Pause button for the center of the player.
 * It's semantically a button and handles its own visibility transitions.
 */
export const BigButton = React.memo(({ isVisible, isPlaying, className }: BigButtonProps) => {
    const { togglePlay } = usePlayerControls();

    // We now use a <button> element for better accessibility and semantics.
    // The parent div with absolute positioning is removed, as the parent
    // component (`StandardLayout`) is already handling the centering.
    return (
        <button
            onClick={togglePlay}
            // The `cn` utility safely merges default, conditional, and passed-in classes.
            className={cn(
                // Base styles for the button
                "flex items-center justify-center rounded-full",
                "bg-black/40 text-primary", // Softer, semi-transparent background
                "p-4 md:p-5", // Responsive padding for better spacing
                "transition-all duration-300 ease-in-out",
                // Interaction states
                "hover:bg-black/60", // Subtle hover effect
                "focus:outline-none focus:ring-2 focus:ring-white/50", // Accessibility focus ring
                // Visibility states
                {
                    "opacity-100 scale-100": isVisible,
                    "opacity-0 scale-90 pointer-events-none": !isVisible,
                },
                className
            )}
            // ARIA label for screen readers
            aria-label={isPlaying ? "Pause" : "Play"}
        >
            {isPlaying ? (
                <Icons.PauseIcon className="h-10 w-10 md:w-12 md:h-12 fill-current text-primary" />
            ) : (
                // The play icon has a slight offset, ml-1 helps center it visually
                <Icons.PlayIcon className="h-10 w-10 md:w-12 md:h-12 fill-current text-primary" />
            )}
        </button>
    );
});
