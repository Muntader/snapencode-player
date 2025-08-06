// src/player/components/layouts/ControlsOverlay.tsx

import React, { useRef, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useBitbyte3Player } from "@/core/PlayerProvider";
import { usePlayerStateStore } from "@/store/usePlayerStateStore";
import { usePlayerConfigStore } from "@/store/usePlayerConfigStore";
import { usePlayerControls } from "@/hooks/usePlayerControls";
import { useFullscreenState } from "@/hooks/useFullscreen";
import { usePlayerActivity } from "@/hooks/usePlayerActivity";
import { useInteraction } from "@/hooks/useInteraction";
import { CastingOverlay } from "@/components/layouts/CastingOverlay";
import Header from "@/components/layouts/Header";
import Loader from "@/components/common/Loader";
import BackwardButton from "@/components/controls/BackwardButton";
import { BigButton } from "@/components/controls/BigButton";
import ForwardButton from "@/components/controls/ForwardButton";
import { ControlBottom } from "@/components/controls";
import { cn } from "@/utils/cn";
// ModalContainer import is not needed here, but the hook is.
import { useModal } from "@/store/useModalStore"; // <<< 1. IMPORT THE HOOK

const ControlsOverlay = () => {
    // --- Get STABLE values from React Context ---
    const { cuesContainerRef, playbackRef } = useBitbyte3Player();

    // --- Get DYNAMIC state from Zustand stores ---
    const { isOpen: isModalOpen } = useModal(); // <<< 2. GET THE MODAL'S STATE

    const { isContentLoaded, isPlaying, isBuffering, isAdPlaying, castState } = usePlayerStateStore(
        useShallow((state) => ({
            isContentLoaded: state.isContentLoaded,
            isPlaying: state.isPlaying,
            isBuffering: state.isBuffering,
            isAdPlaying: state.isAdPlaying,
            castState: state.castState,
        }))
    );

    // Get UI configuration directly from the config store
    const { behavior: uiBehavior, components: enabledComponents } = usePlayerConfigStore(
        useShallow((state) => ({
            behavior: state.configuration?.ui?.behavior,
            components: state.components,
        }))
    );

    // --- Hooks for Player Control & Interaction ---
    const { togglePlay } = usePlayerControls();
    const { toggleFullscreen } = useFullscreenState();
    const { areControlsVisible, activityHandlers } = usePlayerActivity({ isPlaying });
    const handleInteraction = useInteraction(togglePlay, toggleFullscreen);
    const controlsRef = useRef<HTMLDivElement>(null);

    const isCasting = castState === 'CONNECTED';
    const areControlsHidden = uiBehavior?.hideControls;

    // Effect to mute local player when casting
    useEffect(() => {
        const video = playbackRef.current;
        if (!video) return;

        const shouldBeMuted = isCasting;
        if (video.muted !== shouldBeMuted) {
            video.muted = shouldBeMuted;
        }
        if (isCasting && !video.paused) {
            video.pause();
        }
    }, [isCasting, playbackRef]);


    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // <<< 3. ADD THE GUARD CLAUSE
        // If a modal is open, this click's only job is to be handled by the modal's
        // "click outside" logic. The overlay should not do anything.
        if (isModalOpen) return;

        // Clicks on the ad container should not do anything here
        if (isAdPlaying) return;

        const target = e.target as HTMLElement;

        // Ignore clicks on any part of the bottom control bar
        if (controlsRef.current && controlsRef.current.contains(target)) return;

        // Ignore clicks that land on any button-like element to prevent double actions
        if (target.closest('button, a[role="button"]')) return;

        handleInteraction();
    };

    // --- RENDER LOGIC (No changes needed below this line) ---

    // 1. Render Casting overlay if applicable
    if (isCasting) {
        return <CastingOverlay />;
    }

    // 2. Render Chromeless/Controls-Free layout if configured
    if (areControlsHidden) {
        return (
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute left-0 right-0 px-2 text-center bottom-[10px] z-10">
                    <div ref={cuesContainerRef} className="cues-container" />
                </div>
            </div>
        );
    }

    // 3. Render the Full Controls Layout
    return (
        <div
            className="absolute inset-0 z-10 flex flex-col"
            {...activityHandlers}
            onClick={handleOverlayClick}
        >
            {/* --- HEADER --- */}
            <div
                className={cn(
                    "absolute w-full p-4 pt-6 bg-gradient-to-b from-black/60 to-transparent transition-all duration-300 ease-in-out z-20",
                    areControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                )}
            >
                {isContentLoaded && !isAdPlaying && <Header />}
            </div>

            {/* --- MIDDLE SECTION (Loader, Big Buttons, Captions) --- */}
            <div className="relative flex-grow flex items-center justify-center">
                {isBuffering && <Loader />}

                {isContentLoaded && !isBuffering && !isAdPlaying && (
                    <div className="flex items-center justify-center gap-x-4">
                        {enabledComponents?.backward && areControlsVisible && (
                            <BackwardButton iconClassName="w-10 h-10 md:w-12 md:h-12 text-primary" />
                        )}
                        <BigButton isVisible={areControlsVisible} isPlaying={isPlaying} />
                        {enabledComponents?.forward && areControlsVisible && (
                            <ForwardButton iconClassName="w-10 h-10 md:w-12 md:h-12 text-primary" />
                        )}
                    </div>
                )}

                {/* Caption container's position adjusts based on control visibility */}
                <div
                    className={cn(
                        "absolute left-0 right-0 px-2 text-center pointer-events-none transition-all duration-300 ease-in-out z-10",
                        areControlsVisible ? 'bottom-[100px]' : 'bottom-[10px]'
                    )}
                >
                    <div ref={cuesContainerRef} className="cues-container" />
                </div>
            </div>

            {/* --- BOTTOM CONTROLS --- */}
            <div
                ref={controlsRef}
                className={cn(
                    "relative transition-all duration-300 ease-in-out z-20",
                    isContentLoaded && !isAdPlaying && areControlsVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-full pointer-events-none'
                )}
            >
                {/* Gradient for better text visibility */}
                <div className="relative bottom-0 w-full  bg-gradient-to-t from-black/70 to-transparent -z-10 pointer-events-none" />
                <ControlBottom />
            </div>
        </div>
    );
};

export default React.memo(ControlsOverlay);
