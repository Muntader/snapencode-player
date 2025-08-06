// src/player/ui/controls/AudioOrSubtitleDropdown.tsx

import React from "react";
import { useTracks } from "@/hooks/useTracks";
import { cn } from "@/utils/cn";
import { LanguageParser } from "@/utils/LanguageParser"; // We will keep and use this!
import { Icons } from "../../common/Icon";

// A more specific type for our tracks
interface DisplayTrack {
    id: number | string;
    label: string;
    language: string;
}

/**
 * A small helper to parse the track label and extract details for a badge.
 * It looks for text inside parentheses, e.g., "English (AAC)" -> "AAC".
 * @param label The full track label from the player engine.
 * @returns The detail text (e.g., "AAC", "SDH") or null if none is found.
 */
const getDetailFromLabel = (label: string): string | null => {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
};

/**
 * Renders the content for the audio/subtitle selection menu with a refined UI,
 * separating language from technical details (like codec or type).
 */
const TracksPanel: React.FC = React.memo(() => {
    const {
        audioTracks,
        textTracks,
        selectedAudioTrackId,
        selectedTextTrackId,
        selectAudioTrack,
        selectTextTrack,
        disableTextTrack,
    } = useTracks();

    if (audioTracks.length <= 1 && textTracks.length === 0) {
        return null;
    }

    const MenuItem = ({ onClick, isSelected, children }: { onClick: () => void; isSelected: boolean; children: React.ReactNode }) => (
        <button
            role="menuitemradio"
            onClick={onClick}
            aria-checked={isSelected}
            className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-md py-2 px-2.5 text-left text-sm transition-colors duration-150 ease-in-out hover:bg-slate-100 focus:bg-slate-100 focus:outline-none",
                isSelected ? "font-semibold text-blue-600" : "text-slate-600"
            )}
        >
            {children}
            {isSelected && <Icons.CheckIcon className="h-5 w-5 flex-shrink-0" />}
        </button>
    );

    const renderTrackItem = (track: DisplayTrack) => {
        // 1. Get the full language name (e.g., "English") as you requested.
        const languageName = LanguageParser(track.language, "en");
        // 2. Extract the detail (e.g., "AAC", "SDH") for the badge.
        const detail = getDetailFromLabel(track.label);

        return (
            <div className="flex w-full items-center justify-between">
                <span>{languageName}</span>
                {/* 3. If a detail exists, display it as a styled badge. */}
                {detail && (
                    <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {detail}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className={`grid gap-x-6 gap-y-2 ${audioTracks.length > 1 && textTracks.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Audio Tracks Column */}
            {audioTracks.length > 1 && (
                <div className="w-full">
                    <h3 className="mb-1 px-2 text-sm font-bold text-slate-800">Audio</h3>
                    <div className="flex flex-col">
                        {audioTracks.map((track: any) => (
                            <MenuItem
                                key={`audio-${track.id}`}
                                onClick={() => selectAudioTrack(track.id)}
                                isSelected={selectedAudioTrackId === track.id}
                            >
                                {renderTrackItem(track)}
                            </MenuItem>
                        ))}
                    </div>
                </div>
            )}

            {/* Text Tracks (Subtitles/Captions) Column */}
            {textTracks.length > 0 && (
                <div className="w-full">
                    <h3 className="mb-1 px-2 text-sm font-bold text-slate-800">Subtitles</h3>
                    <div className="flex flex-col">
                        <MenuItem onClick={disableTextTrack} isSelected={selectedTextTrackId === null}>
                            Off
                        </MenuItem>
                        {textTracks.map((track: DisplayTrack) => (
                            <MenuItem
                                key={`text-${track.id}`}
                                onClick={() => selectTextTrack(track.id)}
                                isSelected={selectedTextTrackId === track.id}
                            >
                                {renderTrackItem(track)}
                            </MenuItem>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default TracksPanel;
