import React from "react";
import { useShallow } from "zustand/react/shallow";
import PlayPauseButton from "./PlayPauseButton";
import VolumeButton from "./VolumeButton";
import FullscreenButton from "./FullscreenButton";
import ChromecastButton from "./ChromecastButton";
import PipButton from "./PipButton";
import {usePlayerStateStore} from "@/store/usePlayerStateStore";
import {useHasNext, useHasPlaylist, usePlayerConfigStore} from "@/store/usePlayerConfigStore";
import ProgressBar from "@/components/timeline/ProgressBar";
import NextButton from "@/components/controls/NextButton";
import {SettingsButton} from "@/components/settings/SettingButton";
import {PlaylistButton} from "@/components/playlist/PlaylistButton";

export const ControlBottom = () => {
    const enabledComponents = usePlayerConfigStore(state => state.components);
    const {
        isContentLoaded,
        isBuffering,
        isAdPlaying,
        isLive,
        isSeekable
    } = usePlayerStateStore(
        useShallow((state) => ({
            isContentLoaded: state.isContentLoaded,
            isBuffering: state.isBuffering,
            isAdPlaying: state.isAdPlaying,
            isLive: state.isLive,
            isSeekable: state.isSeekable,
        }))
    );

    const hasNext = useHasNext();
    const hasPlaylist = useHasPlaylist();

    // --- NEW: A clear boolean for showing primary controls ---
    // This mirrors the logic in StandardLayout.tsx for consistency.
    const showPrimaryControls = isContentLoaded && !isBuffering && !isAdPlaying;

    return (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col p-2 md:p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300">
            {/* Progress Bar: Only show when content is loaded and not in an ad */}
            {isContentLoaded && !isAdPlaying && (
                <div className="flex items-center">
                    <ProgressBar />
                </div>
            )}
            {/* Main Controls Row */}
            <div className="flex items-center justify-between w-full px-1">
                {/* Left Controls (Desktop) */}
                <div className="hidden md:flex flex-1 items-center justify-start gap-x-1">
                    {/* --- UPDATED: Apply consistent visibility logic --- */}
                    {enabledComponents?.playPause && <PlayPauseButton />}

                    {enabledComponents?.volume && <VolumeButton />}

                    {isLive && (
                        <div className="flex items-center gap-x-2 ml-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-red-500 text-sm font-bold uppercase tracking-wider">LIVE</span>
                        </div>
                    )}
                </div>

                {/* Center Controls (Mobile) */}
                <div className="flex md:hidden flex-1 items-start gap-x-4">
                    {/* --- UPDATED: Apply consistent visibility logic --- */}
                    {showPrimaryControls && enabledComponents?.playPause && <PlayPauseButton />}
                </div>

                {/* Right Controls */}
                <div className="flex flex-1 items-center justify-end gap-x-2">
                    {enabledComponents?.chromecast && <ChromecastButton />}
                    {/* --- USE PlaylistMenu and SettingsMenu HERE --- */}

                    {/* ⭐ ADD NEXT BUTTON FOR MOBILE */}
                    {showPrimaryControls && enabledComponents?.next && hasNext && <NextButton />}
                    {enabledComponents?.playlist && hasPlaylist && <PlaylistButton />}
                    {!isAdPlaying && (
                         <SettingsButton />
                    )}
                    <PipButton />
                    {enabledComponents?.fullscreen && <FullscreenButton />}
                </div>
            </div>
        </div>
    );
};
