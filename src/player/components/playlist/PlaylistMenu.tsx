// src/player/components/playlist/PlaylistMenu.tsx

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { usePlayerConfigStore, useCurrentVideo, useHasPlaylist, useCurrentIndexes } from "@/player/store/usePlayerConfigStore";
import { useOnClickOutside } from "@/player/hooks/useOnClickOutside";
import { Button } from "@/player/components/common/Button";
import { SlidingPanel } from "@/player/components/common/SlidingPanel";
import { cn } from "@/player/utils/cn";
import { Icons } from "@/player/components/common/Icon";
import PlaylistItem from './PlaylistItem';
import {useModal} from "@/player/store/useModalStore";

export const PlaylistMenu: React.FC = () => {
    const isOpen = useModal((state) => state.isOpen);
    const [visiblePlaylistIndex, setVisiblePlaylistIndex] = useState<number | null>(null);

    // --- Get Data from Zustand Store ---
    // ⭐ STEP 1: Get the playlist from the new, correct location.
    const playlist = usePlayerConfigStore(state => state.configuration?.source.playlist) || [];

    const hasPlaylist = useHasPlaylist();
    const currentVideo = useCurrentVideo();
    const { currentPlaylistIndex } = useCurrentIndexes();

    const isMultiPlaylist = playlist.length > 1;

    // Effect to sync the visible panel with the currently playing item when the menu opens
    useEffect(() => {
        console.log('isOpen', isOpen);
        if (isOpen) {
            // Default to showing the currently playing season, or the first list if it's a single playlist
            setVisiblePlaylistIndex(isMultiPlaylist ? currentPlaylistIndex : 0);
        } else {
            // Reset when closed
            setVisiblePlaylistIndex(null);
        }
    }, [isOpen]);


    const visiblePlaylist = visiblePlaylistIndex !== null ? playlist[visiblePlaylistIndex] : null;

    if (!hasPlaylist) {
        return null;
    }

    return (
        <div className="h-full w-full">
            <div
                className={cn(
                    "flex transition-transform duration-300 ease-in-out",
                    "h-[calc(100%-53px)] md:h-auto",
                    isMultiPlaylist && visiblePlaylistIndex === null ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* PANEL 1: SEASONS LIST */}
                <div className="w-full flex-shrink-0 p-1">
                    <div className="p-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Seasons</h3>
                    </div>
                    {playlist.map((p, index) => (
                        <button
                            key={p.id} // Use the new `id` field from the Playlist type
                            onClick={() => setVisiblePlaylistIndex(index)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100",
                                visiblePlaylistIndex === index && "bg-slate-100"
                            )}
                        >
                            <span>{p.title}</span>
                            <Icons.ChevronRightIcon className="h-4 w-4 text-slate-400" />
                        </button>
                    ))}
                </div>

                {/* PANEL 2: EPISODES LIST */}
                <div className="w-full flex-shrink-0">
                    {visiblePlaylist && visiblePlaylistIndex !== null && (
                        <SlidingPanel
                            title={visiblePlaylist.title}
                            showBack={isMultiPlaylist}
                            onBack={() => setVisiblePlaylistIndex(null)}
                        >
                            <div className="space-y-1">
                                {visiblePlaylist.items.map((item, itemIndex) => (
                                    <PlaylistItem
                                        key={item.videoURL}
                                        item={item}
                                        playlistIndex={visiblePlaylistIndex}
                                        itemIndex={itemIndex}
                                        isActive={item.videoURL === currentVideo?.videoURL}
                                    />
                                ))}
                            </div>
                        </SlidingPanel>
                    )}
                </div>
            </div>
        </div>
    );
};
