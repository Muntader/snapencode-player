// src/player/core/PlayerProvider.tsx

import React, { createContext, useContext, useMemo, useEffect, useState, useRef } from "react";
// @ts-ignore
import shaka from 'shaka-player/dist/shaka-player.compiled.debug';

// --- CONTEXT DEFINITION ---
// The context only holds stable or rarely changing values.
// This is critical for performance to avoid unnecessary re-renders.
interface PlayerContextType {
    /** The core Shaka Player instance. Null until initialized. */
    player: shaka.Player | null;
    /** The Shaka CastProxy instance for Chromecast. Null until initialized. */
    castProxy: shaka.cast.CastProxy | null;
    /** A React ref pointing to the <video> element. */
    playbackRef: React.RefObject<HTMLMediaElement>;
    /** A React ref pointing to the main player container <div>. */
    containerRef: React.RefObject<HTMLDivElement>;
    /** A React ref pointing to the ad container <div>. */
    adContainerRef: React.RefObject<HTMLDivElement>;
    /** A React ref pointing to the container for custom caption cues. */
    cuesContainerRef: React.RefObject<HTMLDivElement>;
    /**
     * A stable callback function to attach the <video> element to the provider's state.
     * This is used as the `ref` prop on the <video> tag.
     */
    setPlayback: (node: HTMLMediaElement | null) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

/**
 * Custom hook to easily access the stable player context.
 * Throws an error if used outside of a PlayerProvider.
 */
export const useBitbyte3Player = (): PlayerContextType => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("useBitbyte3Player must be used within a PlayerProvider");
    }
    return context;
};

// --- PLAYER PROVIDER COMPONENT ---

interface PlayerProviderProps {
    children: React.ReactNode;
}

const CAST_CONFIG = {
    // Replace with your own receiver app ID or use Shaka's default for testing.
    APP_ID: '07AEE832',
};

/**
 * This provider's sole responsibility is to instantiate and destroy the Shaka Player
 * engine and provide stable references to it and its associated DOM elements.
 * It does NOT manage UI state or configuration.
 */
export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
    // --- State & Refs for core instances and DOM nodes ---
    const [playback, setPlayback] = useState<HTMLMediaElement | null>(null);
    const [player, setPlayer] = useState<shaka.Player | null>(null);
    const [castProxy, setCastProxy] = useState<shaka.cast.CastProxy | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const adContainerRef = useRef<HTMLDivElement>(null);
    const cuesContainerRef = useRef<HTMLDivElement>(null);
    // Use a ref to hold the playback element to avoid stale closures in event handlers.
    const playbackRef = useRef<HTMLMediaElement | null>(playback);
    useEffect(() => { playbackRef.current = playback; }, [playback]);

    // --- Core Instance Lifecycle Effect ---
    useEffect(() => {
        // Don't initialize until the <video> element is mounted.
        if (!playback) return;

        console.log("PROVIDER: Initializing Shaka Player instance...");
        shaka.polyfill.installAll();

        const playerInstance = new shaka.Player(playback);
        setPlayer(playerInstance);

        // Initialize Chromecast functionality if an App ID is provided.
        if (CAST_CONFIG.APP_ID) {
            try {
                const castProxyInstance = new shaka.cast.CastProxy(
                    playback,
                    playerInstance,
                    CAST_CONFIG.APP_ID
                );
                setCastProxy(castProxyInstance);
                console.log("PROVIDER: CastProxy created with app ID:", CAST_CONFIG.APP_ID);
            } catch (error) {
                console.error('PROVIDER: Failed to create CastProxy:', error);
                setCastProxy(null);
            }
        }

        // Return a cleanup function to be called when the component unmounts.
        return () => {
            console.log("PROVIDER: Destroying Shaka Player instance.");
            playerInstance.destroy().catch((e: any) => {
                console.warn('PROVIDER: Error during player destruction:', e);
            });
            setPlayer(null);
            setCastProxy(null);
        };
    }, [playback]); // This effect only runs once when the <video> element is ready.

    // The context value is memoized for performance. It will only update if the
    // player or castProxy instances are created/destroyed, which is rare.
    const contextValue = useMemo(() => ({
        player,
        castProxy,
        playbackRef,
        containerRef,
        adContainerRef,
        cuesContainerRef,
        setPlayback,
    }), [player, castProxy]);

    return (
        // @ts-ignore
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
};
