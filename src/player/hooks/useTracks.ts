import { usePlayerStateStore } from '../store/usePlayerStateStore';
import {useShallow} from "zustand/react/shallow";
import {usePlayerControls} from "@/player/hooks/usePlayerControls";

/**
 * Provides state and actions for managing audio, video, and text tracks.
 *
 * @returns An object with lists of available tracks, the currently selected tracks, and actions to change them.
 */
export const useTracks = () => {
    // Select all track-related state
    const trackState = usePlayerStateStore(
        useShallow((state) => ({
            audioTracks: state.audioTracks,
            videoTracks: state.videoTracks,
            textTracks: state.textTracks,
            selectedAudioTrackId: state.selectedAudioTrackId,
            selectedVideoTrackId: state.selectedVideoTrackId,
            selectedTextTrackId: state.selectedTextTrackId,
            isAbrEnabled: state.isAbrEnabled,
        }))
    );
    // Get track-related actions from the controls hook
    const { selectAudioTrack, selectVideoQuality, selectTextTrack, disableTextTrack, enableAutoABR } = usePlayerControls();

    return {
        ...trackState,
        selectAudioTrack,
        selectVideoQuality,
        selectTextTrack,
        disableTextTrack,
        enableAutoABR
    };
};
