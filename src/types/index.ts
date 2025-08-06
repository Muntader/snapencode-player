// src/player/types/index.ts

// @ts-ignore
import shaka from "shaka-player/dist/shaka-player.compiled";

// ============================================================================
// 1. CORE CONFIGURATION (The Single Source of Truth)
// ============================================================================


export interface Configuration {
    /**
     * **Content & Playback**
     * Defines what to play and how to play it.
     */
    source: {
        /** The list of playlists (e.g., seasons). Must contain at least one playlist with one item. */
        playlist: Playlist[];
    };

    behavior?: {
        /** If true, the video will start in a muted state. Defaults to false. */
        startMuted?: boolean;
        /** If true, the player will attempt to use low-latency streaming modes. Defaults to false. */
        lowLatency?: boolean;
        /** The ISO 639-1 language code for the default audio track. */
        defaultAudioLanguage?: string;
        /** The ISO 639-1 language code for the default text track (subtitles). */
        defaultTextLanguage?: string;
    };

    /**
     * **UI Configuration**
     * All settings related to the player's appearance and user interface.
     */
    ui?: UiConfig;

    /**
     * **DRM, Ads, and Technical Overrides**
     * Advanced configurations for protected content and engine behavior.
     */
    advanced?: {
        ads?: AdsConfig;
        drm?: DrmConfig;
        /** Direct access to override Shaka Player's internal configuration. Use with caution. */
        shakaConfig?: shaka.extern.PlayerConfiguration;
    };

    /**
     * **NEW: Analytics Configuration**
     * Optional configuration for analytics providers.
     */
    analytics?: {
        /** Your Mux environment key. If provided, Mux analytics will be enabled. */
        mux?: {
            envKey: string;
            // You can add more Mux-specific details here like viewerId, videoId, etc.
            videoTitle?: string;
        };
        // You could add other providers here in the future.
        // googleAnalytics?: { trackingId: string };
    };
}


// ============================================================================
// 2. UI-Specific Types (Nested under `Configuration.ui`)
// ============================================================================

export interface UiConfig {
    theme?: {
        primaryColor?: string;
        fontFamily?: string;
        playerBackgroundColor?: string;
        captions?: CaptionTheme;
    };
    layout?: {
        width?: string;
        height?: string;
        logoUrl?: string;
        logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
    behavior?: {
        hideControls?: boolean;
        doubleClickToToggleFullscreen?: boolean;
    };
    /** A map to enable or disable specific UI control components. */
    components?: Partial<UIComponentsConfig>;
}

export interface UIComponentsConfig {
    playPause?: boolean;
    forward?: boolean;
    backward?: boolean;
    next?: boolean;
    volume?: boolean;
    playlist?: boolean;
    qualitySelector?: boolean;
    trackSelector?: boolean;
    fullscreen?: boolean;
    chromecast?: boolean;
}

export interface CaptionTheme {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
    edgeType?: 'none' | 'drop-shadow' | 'raised' | 'uniform';
    fontWeight?: number;
    fontStyle?: 'normal' | 'italic';
}


// ============================================================================
// 3. Content & Feature-Specific Types
// ============================================================================

export interface Playlist {
    title: string;
    /** A unique ID for this playlist (e.g., 'season-1'). */
    id: string;
    items: VideoItem[];
}
/**
 * Represents a single highlight moment or chapter marker on the timeline.
 */
export interface StoryMarker {
    /** The time in seconds where the marker should appear. */
    startTime: number;
    endTime: number;
    /** The text label to show in the tooltip when hovering over the marker. */
    label: string;
    /** An optional color for the marker dot. Defaults to the primary theme color. */
    color?: string;
    type: 'chapter' | 'highlight';
}


export interface VideoItem {
    videoURL: string;
    title?: string;
    description?: string;
    posterURL?: string;
    duration?: number;
    lastWatchedPosition?: number;
    thumbnail?: string; // VTT thumbnail URL
    skipList?: SkipInterval[];
    isLive?: boolean;
    markers?: StoryMarker[]; // <-- ADD THIS NEW PROPERTY
}

export interface SkipInterval {
    title?: string;
    startTime: number;
    endTime: number;
}

export interface Ad {
    adTagUrl: string;
    type?: 'preroll' | 'midroll' | 'postroll';
}

export interface AdsConfig {
    adTags: Ad[];
}

export interface DrmConfig {
    servers?: {
        'com.widevine.alpha'?: string;
        'com.microsoft.playready'?: string;
        'com.apple.fps'?: string;
    };
    advanced?: { [key: string]: shaka.extern.AdvancedDrmConfiguration };
    clearKeys?: Record<string, string>;
    fairplayCertificateUri?: string;
    axinomToken?: string;
}

export type CastState = 'NO_DEVICES_AVAILABLE' | 'NOT_CONNECTED' | 'CONNECTING' | 'CONNECTED';



// ============================================================================
// 4. Default Values
// ============================================================================

export const DEFAULT_COMPONENTS_CONFIG: Required<UIComponentsConfig> = {
    playPause: true,
    forward: true,
    backward: true,
    next: true,
    volume: true,
    playlist: true,
    qualitySelector: true,
    trackSelector: true,
    fullscreen: true,
    chromecast: true,
};


