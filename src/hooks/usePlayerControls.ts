import {useCallback} from 'react';
import {usePlayerStateStore} from '../store/usePlayerStateStore';
import {useBitbyte3Player} from "@/core/PlayerProvider";

/**
 * A custom hook that provides a stable and unified API for controlling the player.
 * It abstracts away the complexity of handling main content vs. ad playback.
 * UI components should use this hook to trigger all player actions.
 *
 * @returns An object containing stable functions to control the player.
 */
export const usePlayerControls = () => {
    const { playbackRef, containerRef, player } = useBitbyte3Player();

    /**
     * Toggles the playback state.
     * If an ad is currently playing, it will pause/resume the ad.
     * Otherwise, it will pause/resume the main video content.
     */
    const togglePlay = useCallback(() => {
        const { isAdPlaying } = usePlayerStateStore.getState();
        const adManager = player?.getAdManager();

        if (isAdPlaying && adManager?.isAdDisplayed()) {
            const ad = adManager.getCurrentAd();
            if (ad) {
                if (ad.isPaused()) {
                    ad.resume();
                } else {
                    ad.pause();
                }
            }
        } else {
            const videoElement = playbackRef.current;
            if (videoElement) {
                if (videoElement.paused) {
                    videoElement.play();
                } else {
                    videoElement.pause();
                }
            }
        }
    }, [player, playbackRef]);

    /**
     * Seeks the main content to a specific time (in seconds).
     * This action is clamped to the current seekable range (for VOD and Live DVR).
     * It does not affect ad playback.
     * @param {number} time - The time in seconds to seek to.
     */
    const seek = useCallback((time: number) => {
        const videoElement = playbackRef.current;
        if (videoElement) {
            const { seekRange } = usePlayerStateStore.getState();
            videoElement.currentTime = Math.max(seekRange.start, Math.min(time, seekRange.end));
        }
    }, [playbackRef]);

    /**
     * Seeks the main content forward by a specified number of seconds.
     * @param {number} [seconds=10] - The number of seconds to jump forward.
     */
    const seekForward = useCallback((seconds: number = 10) => {
        const videoElement = playbackRef.current;
        if (videoElement) {
            seek(videoElement.currentTime + seconds);
        }
    }, [playbackRef, seek]);

    /**
     * Seeks the main content backward by a specified number of seconds.
     * @param {number} [seconds=10] - The number of seconds to jump backward.
     */
    const seekBackward = useCallback((seconds: number = 10) => {
        const videoElement = playbackRef.current;
        if (videoElement) {
            seek(videoElement.currentTime - seconds);
        }
    }, [playbackRef, seek]);

    /**
     * Sets the player's volume and unmutes it.
     * @param {number} volume - The volume level, from 0.0 to 1.0.
     */
    const setVolume = useCallback((volume: number) => {
        const videoElement = playbackRef.current;
        if (videoElement) {
            videoElement.muted = false;
            videoElement.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
        }
    }, [playbackRef]);

    /**
     * Toggles the player's muted state.
     */
    const toggleMute = useCallback(() => {
        const videoElement = playbackRef.current;
        if (videoElement) {
            videoElement.muted = !videoElement.muted;
        }
    }, [playbackRef]);

    /**
     * Toggles fullscreen mode for the player container.
     */
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch((err: { message: any; name: any; }) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }, [containerRef]);

    /**
     * Skips the currently active interval (e.g., "Skip Intro").
     * This reads the active interval from the state store and jumps to its end time.
     */
    const skip = useCallback(() => {
        const videoElement = playbackRef.current;
        if (videoElement) {
            const { activeSkipInterval } = usePlayerStateStore.getState();
            if (activeSkipInterval) {
                seek(activeSkipInterval.endTime);
            }
        }
    }, [playbackRef, seek]);

    // --- Text Track (Subtitles) Controls ---
    const selectTextTrack = useCallback((trackId: number | string) => {
        if (!player) return;
        player.selectTextTrack(player.getTextTracks().find((t: { id: number; }) => t.id === trackId));
    }, [player]);

    const disableTextTrack = useCallback(() => {
        if (!player) return;
        // The correct way to disable subtitles is to set visibility to false.
        // It keeps the track selected but hidden, allowing it to be easily re-enabled.
        player.setTextTrackVisibility(false);
        usePlayerStateStore.getState().actions.updateState({ isTextTrackDisabled: true });
    }, [player]);

    // --- Automatic Bitrate (ABR) Control ---
    const enableAutoABR = useCallback(() => {
        if (!player) return;
        player.configure({ abr: { enabled: true } });
        usePlayerStateStore.getState().actions.updateState({ selectedVideoTrackId: 0, isAbrEnabled: true });
    }, [player]);

    // --- ⭐ NEW AND IMPROVED TRACK SELECTION LOGIC ⭐ ---

    /**
     * Selects a specific video quality (e.g., 720p, 1080p) and disables ABR.
     * This function intelligently preserves the currently selected audio language.
     *
     * @param {number} videoTrackId - The unique ID of the *variant track* containing the desired video quality.
     */
    const selectVideoQuality = useCallback((videoTrackId: number) => {
        if (!player) return;

        const variantTracks = player.getVariantTracks();
        const targetTrack = variantTracks.find((t: { id: number; }) => t.id === videoTrackId);

        if (!targetTrack) {
            console.warn(`selectVideoQuality: Track with ID ${videoTrackId} not found.`);
            return;
        }

        // 1. Get the current audio language to preserve it.
        const currentAudioLanguage = player.getVariantTracks().find((t: { active: any; }) => t.active)?.language;

        // 2. Find the best matching variant: one with the target video quality
        //    AND the current audio language.
        let trackToSelect = variantTracks.find((track: { height: any; language: any; }) =>
            track.height === targetTrack.height && track.language === currentAudioLanguage
        );

        // 3. Fallback: If no exact match is found (e.g., 4K is only in English),
        //    select the target track anyway. The audio language will change.
        if (!trackToSelect) {
            console.log(`Could not find [${currentAudioLanguage}] audio for ${targetTrack.height}p. Falling back.`);
            trackToSelect = targetTrack;
        }

        // 4. Disable ABR and select the chosen variant track.
        player.configure({ abr: { enabled: false } });
        player.selectVariantTrack(trackToSelect, true); // `true` clears buffer for a faster switch
        usePlayerStateStore.getState().actions.updateState({ selectedVideoTrackId: videoTrackId, isAbrEnabled: false });

    }, [player]);

    /**
     * ⭐ NEW: Selects a specific audio track by its ID, preserving the current video quality.
     * This is the recommended function to use from the UI.
     * @param {number} audioTrackId - The `audioId` of the track to select from our mapped `audioTracks` state.
     */
    const selectAudioTrack = useCallback((audioTrackId: number) => {
        if (!player) return;
        const allVariants = player.getVariantTracks();
        const currentActiveVariant = allVariants.find((t: { active: any; }) => t.active);

        // Find the details of the audio track we want to switch to
        const targetAudioVariant = allVariants.find((v: { audioId: number; }) => v.audioId === audioTrackId);
        if (!targetAudioVariant) {
            console.warn(`Audio track with ID ${audioTrackId} not found in any variant.`);
            return;
        }

        // Find the best new variant: one with the TARGET audio language and the CURRENT video height.
        // This is crucial for preserving video quality.
        const idealVariant = allVariants.find((v: { language: any; height: any; }) =>
            v.language === targetAudioVariant.language && v.height === currentActiveVariant?.height
        ) || targetAudioVariant; // Fallback to the first available variant for that language

        player.selectVariantTrack(idealVariant, true);

        // ⭐ SOLUTION FOR PROBLEM 2: Perform an optimistic state update.
        // This makes the UI feel instantaneous. The `syncPlayerStateWithStore`
        // will still run later to confirm and sync the full state.
        usePlayerStateStore.getState().actions.updateState({ selectedAudioTrackId: audioTrackId });

    }, [player]);

    // The high-level language selection can still be useful internally or as a fallback.
    const selectAudioLanguage = useCallback((language: string) => {
        if (!player) return;
        player.selectAudioLanguage(language);
        // We can't know the exact new audioId here, so we let the sync handler do the work.
        // The UI might feel slightly slower, which is why `selectAudioTrack` is preferred.
    }, [player]);



    return {
        // Core controls
        togglePlay,
        seek,
        seekForward,
        seekBackward,
        setVolume,
        toggleMute,
        toggleFullscreen,
        skip,
        // Subtitle controls
        selectTextTrack,
        disableTextTrack,
        // ⭐ EXPORT THE NEW, CLEARER FUNCTIONS ⭐
        selectAudioLanguage,
        selectAudioTrack,
        selectVideoQuality,
        enableAutoABR,
    };
};
