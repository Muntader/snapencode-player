// src/player/components/controls/ChromecastButton.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore
import shaka from 'shaka-player/dist/shaka-player.compiled.debug';
// ⭐ STEP 1: Import the new unified Configuration and VideoItem types
import { Configuration, VideoItem } from "@/player/types";
import { useBitbyte3Player } from "@/player/core/PlayerProvider";
// ⭐ STEP 2: Import the correct store and selectors
import { usePlayerConfigStore, useCurrentVideo } from "@/player/store/usePlayerConfigStore";
import { usePlayerStateStore } from "@/player/store/usePlayerStateStore";
import { useShallow } from 'zustand/react/shallow';
import { Icons } from "@/player/components/common/Icon";
import { Button } from "@/player/components/common/Button";


/**
 * Creates a clean, JSON-serializable application data object for the cast receiver.
 * ⭐ This function is now updated to accept the unified `Configuration` object.
 */
function createCastAppData(config: Configuration, video: VideoItem) {
    // This is much cleaner. All advanced config is in one place.
    const drmConfig = config.advanced?.drm || {};
    // Deep copy to avoid mutating the original config object
    const castableDrmConfig = JSON.parse(JSON.stringify(drmConfig));

    if (drmConfig.axinomToken) {
        const headers = { 'X-AxDRM-Message': drmConfig.axinomToken };
        if (!castableDrmConfig.advanced) {
            castableDrmConfig.advanced = {};
        }

        const widevineConfig = castableDrmConfig.advanced['com.widevine.alpha'] || {};
        widevineConfig.licenseRequestHeaders = { ...widevineConfig.licenseRequestHeaders, ...headers };
        castableDrmConfig.advanced['com.widevine.alpha'] = widevineConfig;

        delete castableDrmConfig.axinomToken;
    }

    return {
        // --- Core Content ---
        manifestUri: video.videoURL,
        title: video.title,
        poster: video.posterURL,

        // --- Player Configuration for the Receiver ---
        playerConfiguration: {
            drm: castableDrmConfig,
            manifest: { ...config.advanced?.shakaConfig?.manifest },
            streaming: { ...config.advanced?.shakaConfig?.streaming },
            abr: { ...config.advanced?.shakaConfig?.abr },
        },
    };
}

/**
 * A self-contained Chromecast button that uses the new unified configuration model.
 */
export const ChromecastButton: React.FC = () => {
    // --- Get STABLE values from Context ---
    const { player, castProxy, playbackRef } = useBitbyte3Player();

    // --- Get DYNAMIC state and config from Zustand ---
    const { castState, castDeviceName, setCastState } = usePlayerStateStore(
        useShallow(state => ({
            castState: state.castState,
            castDeviceName: state.castDeviceName,
            setCastState: state.actions.setCastState,
        }))
    );
    const configuration = usePlayerConfigStore(state => state.configuration);
    const currentVideo = useCurrentVideo();

    // ⭐ STEP 1: Use a ref instead of state for the last playback info.
    // This prevents re-renders when we save the playback state.
    const lastPlaybackStateRef = useRef<{ currentTime: number; paused: boolean; volume: number; } | null>(null);
    const previousCastStateRef = useRef<string | null>(null);

    // Add debouncing to prevent rapid state changes
    const lastCheckTimeRef = useRef<number>(0);
    const stateUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // --- Main Logic & Callbacks ---
    const checkCastStatus = useCallback(() => {
        if (!castProxy) return;

        // Debounce checks to prevent rapid state changes
        const now = Date.now();
        if (now - lastCheckTimeRef.current < 500) { // Minimum 500ms between checks
            return;
        }
        lastCheckTimeRef.current = now;

        const isCasting = castProxy.isCasting();
        const canCast = castProxy.canCast();
        const currentStoreState = usePlayerStateStore.getState().castState;

        // Clear any pending state update
        if (stateUpdateTimeoutRef.current) {
            clearTimeout(stateUpdateTimeoutRef.current);
            stateUpdateTimeoutRef.current = null;
        }

        // Determine the correct state with better logic
        let newState: string | null = null;
        let deviceName: string | null = null;

        if (isCasting) {
            newState = 'CONNECTED';
            deviceName = castProxy.receiverName();
        } else if (canCast) {
            newState = 'NOT_CONNECTED';
        } else {
            newState = 'NO_DEVICES_AVAILABLE';
        }

        // Only update state if it actually changed
        if (newState !== currentStoreState) {
            // Add a small delay to prevent rapid state changes
            stateUpdateTimeoutRef.current = setTimeout(() => {
                setCastState(newState as any, deviceName);
            }, 100);
        }

        const previousState = previousCastStateRef.current;
        const localVideo = playbackRef.current;

        // If we just connected, save the local state to the ref.
        if (isCasting && previousState !== 'CONNECTED' && localVideo) {
            lastPlaybackStateRef.current = {
                currentTime: localVideo.currentTime,
                paused: localVideo.paused,
                volume: localVideo.volume
            };
        }
        // If we just disconnected, restore local playback using the ref's value.
        else if (!isCasting && previousState === 'CONNECTED' && player && currentVideo && localVideo && lastPlaybackStateRef.current) {
            const stateToRestore = lastPlaybackStateRef.current;
            // Restore local playback
            setTimeout(() => {
                player.load(currentVideo.videoURL, stateToRestore.currentTime).then(() => {
                    if (playbackRef.current) {
                        playbackRef.current.volume = stateToRestore.volume;
                        if (!stateToRestore.paused) playbackRef.current.play();
                    }
                }).catch(console.error);
            }, 100);
            // Clear the ref after using it.
            lastPlaybackStateRef.current = null;
        }
        previousCastStateRef.current = currentStoreState;
    }, [castProxy, player, currentVideo, playbackRef, setCastState]);

    // This effect now has a stable callback and will only run when castProxy is available.
    useEffect(() => {
        if (!castProxy) return;

        const onCastStatusChange = () => checkCastStatus();
        checkCastStatus(); // Initial sync

        castProxy.addEventListener('caststatuschanged', onCastStatusChange);
        // Reduced polling frequency to prevent rapid state changes
        const intervalId = setInterval(checkCastStatus, 3000); // Increased to 3 seconds

        return () => {
        };
    }, [castProxy, checkCastStatus]);

    const handleCastToggle = useCallback(async () => {
        if (!player || !castProxy || !configuration || !currentVideo || castState === 'NO_DEVICES_AVAILABLE') return;

        if (castState === 'CONNECTED') {
            castProxy.suggestDisconnect();
        } else {
            const localVideo = player.getMediaElement();
            const currentTime = localVideo?.currentTime || 0;
            if (localVideo) {
                // Save state to the ref just before casting begins.
                lastPlaybackStateRef.current = { currentTime, paused: localVideo.paused, volume: localVideo.volume };
            }

            setCastState('CONNECTING');
            try {
                const appData = createCastAppData(configuration, currentVideo);
                castProxy.setAppData(appData);
                await castProxy.cast(currentTime);
            } catch (error) {
                const shakaError = error as shaka.util.Error;
                if (shakaError.code !== shaka.util.Error.Code.CAST_CANCELED_BY_USER) {
                    console.error("Error during casting:", shakaError);
                }
                setCastState('NOT_CONNECTED');
                lastPlaybackStateRef.current = null; // Clear the saved state on failure/cancellation.
            }
        }
    }, [player, castProxy, castState, configuration, currentVideo, setCastState]);

    // --- Render Logic ---
    console.log("RENDER: ChromecastButton", { castState, castDeviceName });

    // Add a more stable condition for hiding the button
    // Only hide if we're certain no devices are available
    if (castState === 'NO_DEVICES_AVAILABLE') {
        return null; // Don't show the button if no devices are found.
    }

    const isCasting = castState === 'CONNECTED';
    const isConnecting = castState === 'CONNECTING';
    const Icon = isCasting ? Icons.CastConnectedIcon : Icons.CastIcon;
    const title = isCasting ? `Casting to ${castDeviceName}` : 'Cast to a device';

    return (
        <Button onClick={handleCastToggle} title={title} disabled={isConnecting} aria-label="cast">
            <Icon className="w-6 h-6 fill-current text-primary" />
        </Button>
    );
};

export default ChromecastButton;
