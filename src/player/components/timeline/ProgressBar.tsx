import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTimeline } from "@/player/hooks/useTimeline";
import { usePlayerStateStore } from "@/player/store/usePlayerStateStore";
import { useCurrentVideo } from "@/player/store/usePlayerConfigStore";
import ParseVTTFile, { VttCue } from "@/player/utils/VttParser";
import FormatTime from "@/player/utils/FormatTime";
import { Slider, SliderChapter, SliderMarker } from "@/player/components/timeline/Slider";
import { StoryMarker } from "@/player/types";

const ProgressBar: React.FC = React.memo(() => {
    // Hooks for state management (no changes here)
    const { currentTime, duration, seek, isLive, isSeekable } = useTimeline();
    const { isAdPlaying } = usePlayerStateStore(useShallow(state => ({ isAdPlaying: state.isAdPlaying })));
    const currentVideo = useCurrentVideo();

    // State for UI synchronization
    const [vttCues, setVttCues] = useState<VttCue[]>([]);
    const [optimisticValue, setOptimisticValue] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // VTT logic (no changes here)
    useEffect(() => {
        if (!isLive && isSeekable && currentVideo?.thumbnail) {
            let isActive = true;
            ParseVTTFile(currentVideo.thumbnail).then((parsedCues) => { if (isActive) setVttCues(parsedCues); });
            return () => { isActive = false; };
        }
    }, [isLive, isSeekable, currentVideo?.thumbnail]);

    const spriteDimensionsMap = useMemo(() => {
        if (vttCues.length === 0) return {};
        const dimensions: Record<string, { width: number; height: number }> = {};
        for (const cue of vttCues) {
            if (!cue.spriteUrl || dimensions[cue.spriteUrl]) continue;
            const img = new Image();
            img.src = cue.spriteUrl;
            img.onload = () => {
                dimensions[cue.spriteUrl] = { width: img.width, height: img.height };
            };
        }
        return dimensions;
    }, [vttCues]);

    // Marker processing (no changes here)
    const { chapters, highlights } = useMemo(() => {
        if (!duration || !currentVideo?.markers) {
            return { chapters: [], highlights: [] };
        }
        const getMarkerTime = (marker: StoryMarker) => 'startTime' in marker ? marker.startTime : marker.time;
        const sortedMarkers = [...currentVideo.markers].sort((a, b) => getMarkerTime(a) - getMarkerTime(b));

        const processedChapters: SliderChapter[] = sortedMarkers
            .filter((m): m is StoryMarker & { type: 'chapter' } => m.type === 'chapter');

        const processedHighlights: (StoryMarker & { type: "highlight" })[] = sortedMarkers
            .filter((m): m is StoryMarker & { type: 'highlight' } => m.type === 'highlight');

        return { chapters: processedChapters, highlights: processedHighlights };
    }, [currentVideo?.markers, duration]);

    // --- SIMPLIFIED: Drag and seek handling ---
    const handleSeekCommit = useCallback((finalPercentage: number) => {
        setIsDragging(false);
        if (duration > 0) {
            const time = (finalPercentage / 100) * duration;
            seek(time);
        }
        // Don't nullify optimisticValue immediately, let it sync with currentTime
    }, [duration, seek]);

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    // The current progress as a percentage of the total duration.
    const progress = useMemo(() => (duration > 0 ? (currentTime / duration) * 100 : 0), [currentTime, duration]);

    // This effect smoothly snaps the optimistic value back to the real progress after a seek.
    useEffect(() => {
        if (!isDragging && optimisticValue !== null) {
            if (Math.abs(progress - optimisticValue) < 1.5) {
                setOptimisticValue(null);
            }
        }
    }, [progress, optimisticValue, isDragging]);

    // The value to display on the slider. Use the optimistic value during interactions, otherwise the real progress.
    const displayValue = optimisticValue ?? progress;

    if (isAdPlaying) return <div className="w-full h-1.5 bg-yellow-500 rounded-full" />;
    if (isLive || !isSeekable) return null;

    return (
        <div className="flex w-full items-center gap-x-3 px-2">
            <span className="w-14 select-none text-center text-sm text-white drop-shadow-sm">{FormatTime(currentTime)}</span>

            <Slider
                value={progress} // The actual player progress
                previewValue={displayValue} // The value to show during hover/drag
                onChange={setOptimisticValue} // Update the optimistic value during interaction
                onDragStart={handleDragStart}
                onDragEnd={handleSeekCommit}
                duration={duration}
                chapters={chapters}
                highlights={highlights}
                vttCues={vttCues}
                spriteDimensionsMap={spriteDimensionsMap}
                isDragging={isDragging}
            />

            <span className="w-14 select-none text-center text-sm text-white drop-shadow-sm">{FormatTime(duration)}</span>
        </div>
    );
});

ProgressBar.displayName = 'ProgressBar';
export default ProgressBar;
