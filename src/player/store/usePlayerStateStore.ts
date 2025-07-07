import { create } from "zustand";
// @ts-ignore
import shaka from 'shaka-player/dist/shaka-player.compiled';
import {CastState, SkipInterval} from "@/player/types"; // Adjust import path if needed

// Helper types for tracks
export interface TrackInfo {
    id: number;
    type: 'video' | 'audio';
    active: boolean;
    language?: string;
    label?: string;
    // Video-specific
    width?: number;
    height?: number;
    // Audio-specific
    channelsCount?: number;
}

export interface TextTrackInfo {
    id: number;
    label: string;
    language: string;
    active: boolean;
}

interface PlayerState {
    // ... (all previous state like isPlaying, currentTime, etc.)
    isReady: boolean;
    isContentLoaded: boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    isMuted: boolean;
    volume: number;
    error: shaka.util.Error | null;
    currentTime: number;
    duration: number;
    seekRange: { start: number; end: number };
    isLive: boolean;
    isSeekable: boolean;
    isAdPlaying: boolean;
    adCuePoints: number[]; // <-- ADD THIS
    activeSkipInterval: SkipInterval | null;

    // --- NEW AND UPDATED STATE ---

    // Fullscreen State
    isFullscreenActive: boolean;

    // Tracks State (now includes audio and video)
    audioTracks: TrackInfo[];
    videoTracks: TrackInfo[];
    textTracks: TextTrackInfo[];

    selectedAudioTrackId: number | null;
    selectedVideoTrackId: number | null;
    selectedTextTrackId: number | null;
    isTextTrackDisabled: boolean;
    isAbrEnabled: boolean


    // --- Chromecast State ---
    castState: CastState;
    castDeviceName: string | null;

    // --- NEW PLAYLIST STATE ---
    isPlaylistOpen: boolean;
    currentPlaylistIndex: number; // Index of the current season/playlist
    currentItemIndex: number;   // Index of the current episode/item in that playlist
}

interface PlayerStateActions {
    actions: {
        updateState: (newState: Partial<PlayerState>) => void;
        setAdCuePoints: (cuePoints: number[]) => void;
        // --- Chromecast Actions ---
        setCastState: (newState: CastState, deviceName?: string | null) => void;

        // --- NEW PLAYLIST ACTIONS ---
        togglePlaylist: (open?: boolean) => void;
        setCurrentItem: (playlistIndex: number, itemIndex: number) => void;
    }
}

export const usePlayerStateStore = create<PlayerState & PlayerStateActions>((set) => ({
    // ... (initial state for previous fields)
    isReady: false,
    isContentLoaded: false,
    isPlaying: false,
    isBuffering: true,
    isMuted: false,
    volume: 1,
    error:  null,
    currentTime: 0,
    duration: 0,
    seekRange: { start: 0, end: 0 },
    isLive: false,
    isSeekable: true,
    isAdPlaying: false,
    adCuePoints: [],
    activeSkipInterval: null,
    // --- INITIAL STATE FOR NEW FIELDS ---
    isFullscreenActive: false,
    audioTracks: [],
    videoTracks: [],
    textTracks: [],
    selectedAudioTrackId: null,
    selectedVideoTrackId: null,
    selectedTextTrackId: null,
    isTextTrackDisabled: false,

    isAbrEnabled: true,

    // Chromecast
    castState: 'NO_DEVICES_AVAILABLE',
    castDeviceName: null,


    // --- PLAYLIST ACTION IMPLEMENTATIONS ---
    // --- INITIAL PLAYLIST STATE ---
    isPlaylistOpen: false,
    currentPlaylistIndex: 0,
    currentItemIndex: 0,

    // --- ACTIONS ---

    actions: {
        setCastState: (newState, deviceName = null) => {
            set({
                castState: newState,
                castDeviceName: deviceName
            });
        },
        updateState: (newState) => set(state => ({ ...state, ...newState })),
        setAdCuePoints: (cuePoints: any) => set({ adCuePoints: cuePoints }),

        togglePlaylist: (open?: boolean) => {
            set((state) => ({
                isPlaylistOpen: typeof open === 'boolean' ? open : !state.isPlaylistOpen
            }));
        },
        setCurrentItem: (playlistIndex, itemIndex) => {
            set({ currentPlaylistIndex: playlistIndex, currentItemIndex: itemIndex });
        },
    }
}));
