// src/player/components/playlist/PlaylistItem.tsx

import React from 'react';
// ⭐ STEP 1: Import the new, correct type
import { VideoItem } from '@/types';
import { usePlayerConfigStore } from '@/store/usePlayerConfigStore';
import { cn } from '@/utils/cn';
import { Icons } from "@/components/common/Icon";

interface PlaylistItemProps {
    item: VideoItem;
    playlistIndex: number;
    itemIndex: number;
    isActive: boolean;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ item, playlistIndex, itemIndex, isActive }) => {
    // ⭐ STEP 2: Get the loadNewItem action directly from the store. This is more efficient.
    const { loadNewItem } = usePlayerConfigStore(state => state.actions);

    return (
        <button
            onClick={() => loadNewItem(playlistIndex, itemIndex)}
            className={cn(
                "w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors duration-200",
                // Styles for a light theme to match the menu
                isActive ? "bg-blue-100 text-blue-800" : "text-slate-700 hover:bg-slate-100"
            )}
        >
            {item.posterURL && (
                <img src={item.posterURL} alt={item.title || ''} className="w-24 h-14 object-cover rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <p className={cn("font-semibold truncate", isActive ? "text-blue-800" : "text-slate-800")}>
                    {item.title || 'Untitled Video'}
                </p>
                {item.description && <p className="text-slate-500 text-xs mt-1 truncate">{item.description}</p>}
            </div>
            {isActive && <Icons.PlayIcon className="text-blue-600 w-5 h-5 mr-2 flex-shrink-0" />}
        </button>
    );
};

export default PlaylistItem;
