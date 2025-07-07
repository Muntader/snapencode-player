import { useCallback, useEffect } from "react";
import { useBitbyte3Player } from "@/player/core/PlayerProvider";
import { usePlayerConfigStore } from "@/player/store/usePlayerConfigStore";
import { usePlayerStateStore } from "@/player/store/usePlayerStateStore";

export const usePlaylist = () => {
    const { player } = useBitbyte3Player();
    const { playlist } = usePlayerConfigStore((state) => ({ playlist: state.playlist }));
    const { setCurrentItem, togglePlaylist, currentPlaylistIndex, currentItemIndex } = usePlayerStateStore((state) => ({
        currentPlaylistIndex: state.currentPlaylistIndex,
        currentItemIndex: state.currentItemIndex,
        setCurrentItem: state.setCurrentItem,
        togglePlaylist: state.togglePlaylist,
    }));

    const loadItem = useCallback(async (playlistIndex: number, itemIndex: number) => {
        if (!player || !playlist || !playlist[playlistIndex]?.items[itemIndex]) {
            console.error("Cannot load item: Player or playlist item not found.");
            return;
        }

        const itemToLoad = playlist[playlistIndex].items[itemIndex];

        try {
            console.log(`Loading playlist item: ${itemToLoad.title}`);
            await player.load(itemToLoad.videoURL);
            setCurrentItem(playlistIndex, itemIndex);
            togglePlaylist(false); // Close playlist panel on selection
        } catch (error) {
            console.error("Error loading playlist item:", error);
            // Here you might want to dispatch an error state to the UI
        }
    }, [player, playlist]);

    const loadNextItem = useCallback(() => {
        if (!playlist) return;

        const currentPlaylist = playlist[currentPlaylistIndex];
        if (!currentPlaylist) return;

        let nextItemIndex = currentItemIndex + 1;
        let nextPlaylistIndex = currentPlaylistIndex;

        // Check if we are at the end of the current playlist
        if (nextItemIndex >= currentPlaylist.items.length) {
            // Move to the next playlist (season) if it exists
            nextPlaylistIndex++;
            nextItemIndex = 0; // Start from the first item of the new playlist
        }

        // Check if the next playlist exists
        if (playlist[nextPlaylistIndex]?.items[nextItemIndex]) {
            loadItem(nextPlaylistIndex, nextItemIndex);
        } else {
            console.log("End of all playlists.");
            // Optionally, you can loop back to the beginning or just stop.
        }
    }, [playlist, currentPlaylistIndex, currentItemIndex, loadItem]);

    // Effect to handle auto-play for the next item
    useEffect(() => {
        if (!player) return;

        const onEnded = () => {
            console.log("Video ended, loading next item...");
            loadNextItem();
        };

        player.getMediaElement()?.addEventListener('ended', onEnded);

        return () => {
            player.getMediaElement()?.removeEventListener('ended', onEnded);
        }
    }, [player, loadNextItem]);

    return { loadItem, loadNextItem };
};
