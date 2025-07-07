// src/player/store/usePlayerConfigStore.ts

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Configuration, VideoItem, UIComponentsConfig, DEFAULT_COMPONENTS_CONFIG } from "@/player/types";

// --- STATE & ACTIONS INTERFACES ---

interface ConfigState {
    /** The single, unified configuration object for the player. */
    configuration: Configuration | null;
    /** The index of the currently active playlist/season. */
    currentPlaylistIndex: number;
    /** The index of the currently active video/item within its playlist. */
    currentItemIndex: number;
    /** The final, merged configuration for UI component visibility. */
    components: Required<UIComponentsConfig>;
}

interface ConfigActions {
    /** Initializes the store with the player's configuration and the video to start with. */
    loadConfiguration: (config: Configuration, initialVideo: VideoItem) => void;
    /** Sets a new video as the current item by its location in the playlist. */
    loadNewItem: (playlistIndex: number, itemIndex: number) => void;
    /** Advances the player to the next video in the sequence. */
    playNext: () => void;
}

// --- ZUSTAND STORE IMPLEMENTATION ---

export const usePlayerConfigStore = create<ConfigState & { actions: ConfigActions }>((set, get) => ({
    // --- INITIAL STATE ---
    configuration: null,
    currentPlaylistIndex: -1,
    currentItemIndex: -1,
    components: DEFAULT_COMPONENTS_CONFIG,

    // --- ACTIONS ---
    actions: {
        loadConfiguration: (config, initialVideo) => {
            const playlist = config.source.playlist;
            let initialPlaylistIndex = -1;
            let initialItemIndex = -1;

            for (let i = 0; i < playlist.length; i++) {
                const itemIdx = playlist[i].items.findIndex(v => v.videoURL === initialVideo.videoURL);
                if (itemIdx > -1) {
                    initialPlaylistIndex = i;
                    initialItemIndex = itemIdx;
                    break;
                }
            }

            const mergedComponentsConfig: Required<UIComponentsConfig> = {
                ...DEFAULT_COMPONENTS_CONFIG,
                ...(config.ui?.components || {}),
            };

            set({
                configuration: config,
                currentPlaylistIndex: initialPlaylistIndex,
                currentItemIndex: initialItemIndex,
                components: mergedComponentsConfig,
            });
        },

        loadNewItem: (playlistIndex, itemIndex) => {
            const config = get().configuration;
            if (config?.source.playlist[playlistIndex]?.items[itemIndex]) {
                set({ currentPlaylistIndex: playlistIndex, currentItemIndex: itemIndex });
            }
        },

        playNext: () => {
            const { configuration, currentPlaylistIndex, currentItemIndex } = get();
            if (!configuration) return;

            const playlist = configuration.source.playlist;
            const currentSeason = playlist[currentPlaylistIndex];
            if (!currentSeason) return;

            if (currentItemIndex + 1 < currentSeason.items.length) {
                set({ currentItemIndex: currentItemIndex + 1 });
                return;
            }

            if (currentPlaylistIndex + 1 < playlist.length) {
                set({ currentPlaylistIndex: currentPlaylistIndex + 1, currentItemIndex: 0 });
                return;
            }

            console.log("End of all content.");
        },
    },
}));


// ============================================================================
// 3. Selectors for Derived State
// ============================================================================

/**
 * A selector hook to get the configuration of the currently active video.
 * It derives this data from the state, ensuring it's always in sync.
 *
 * @returns The current `VideoItem` object or `null` if not available.
 */
export const useCurrentVideo = (): VideoItem | null => {
    return usePlayerConfigStore((state) => {
        const { configuration, currentPlaylistIndex, currentItemIndex } = state;
        if (!configuration || currentPlaylistIndex === -1) {
            return null;
        }
        // Access the playlist from within the main configuration object.
        return configuration.source.playlist[currentPlaylistIndex]?.items[currentItemIndex] || null;
    });
};

/**
 * A selector hook to determine if the playlist UI should be rendered.
 * The UI should only appear if there is more than one video available to choose from.
 *
 * @returns `true` if there is a playlist with more than one total item, otherwise `false`.
 */
export const useHasPlaylist = (): boolean => {
    return usePlayerConfigStore((state) => {
        const playlist = state.configuration?.source.playlist;
        if (!playlist || playlist.length === 0) {
            return false;
        }
        // Calculate the total number of items across all "seasons".
        const totalItems = playlist.reduce((sum, p) => sum + (p.items?.length || 0), 0);
        return totalItems > 1;
    });
};

/**
 * A selector hook to determine if there is a next video in the playlist sequence.
 * It checks for more items in the current playlist or for subsequent playlists.
 *
 * @returns `true` if a next video exists, otherwise `false`.
 */
export const useHasNext = (): boolean => {
    return usePlayerConfigStore((state) => {
        const { configuration, currentPlaylistIndex, currentItemIndex } = state;
        if (!configuration || currentPlaylistIndex === -1) {
            return false;
        }

        const playlist = configuration.source.playlist;
        const currentSeason = playlist[currentPlaylistIndex];
        if (!currentSeason) {
            return false;
        }

        // Case 1: Is there another item in the current season/playlist?
        if (currentItemIndex + 1 < currentSeason.items.length) {
            return true;
        }

        // Case 2: If not, is there another season/playlist after this one?
        if (currentPlaylistIndex + 1 < playlist.length) {
            return true;
        }

        // If both checks fail, we are at the end of all content.
        return false;
    });
};

/**
 * A selector hook to get the raw indexes of the currently active item.
 * This is useful for UI components that need to sync with the current season/episode.
 * Uses a shallow comparison to prevent unnecessary re-renders.
 *
 * @returns An object with `{ currentPlaylistIndex, currentItemIndex }`.
 */
export const useCurrentIndexes = () => {
    return usePlayerConfigStore(
        useShallow((state) => ({
            currentPlaylistIndex: state.currentPlaylistIndex,
            currentItemIndex: state.currentItemIndex,
        }))
    );
};
