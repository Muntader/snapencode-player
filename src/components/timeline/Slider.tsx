import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { cn } from "@/utils/cn";
import { VttCue } from "@/utils/VttParser";
import FormatTime from "@/utils/FormatTime";
import { useThrottledCallback } from 'use-debounce';

// Interfaces (no change)
export interface SliderMarker {
    time: number;
    label: string;
    color?: string;
}

export interface SliderChapter {
    startTime: number;
    endTime: number;
    label: string;
}

interface HoverState {
    isVisible: boolean;
    leftPercentage: number;
    time: number;
    vttCue: VttCue | null;
    activeChapter: SliderChapter | null;
    activeHighlight: SliderMarker | null;
}

const INITIAL_HOVER_STATE: HoverState = {
    isVisible: false, leftPercentage: 0, time: 0, vttCue: null, activeChapter: null, activeHighlight: null
};

const THUMBNAIL_SCALE_FACTOR = 0.8;
const CHAPTER_GAP_WIDTH = 3.5; // Gap in pixels between chapters

// Props interface (no change)
interface CustomSliderProps {
    value: number;
    previewValue?: number | null;
    onChange: (newValue: number) => void;
    onDragStart?: () => void;
    onDragEnd: (finalValue: number) => void;
    duration?: number;
    highlights?: SliderMarker[];
    chapters?: SliderChapter[];
    vttCues?: VttCue[];
    spriteDimensionsMap?: Record<string, { width: number, height: number }>;
    isDragging?: boolean;
    className?: string;
    progressColor?: string;
}

export const Slider: React.FC<CustomSliderProps> = React.memo(({
                                                                   value, previewValue, onChange, onDragStart, onDragEnd, duration = 0,
                                                                   highlights = [], chapters = [], vttCues = [], spriteDimensionsMap = {},
                                                                   isDragging = false, className, progressColor = 'slider-track-primary',
                                                               }) => {
    // --- Refs and State ---
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const [hoverState, setHoverState] = useState<HoverState>(INITIAL_HOVER_STATE);
    const [isHovering, setIsHovering] = useState(false);
    const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
    const [dragSegmentIndex, setDragSegmentIndex] = useState<number | null>(null);
    const [internalDragging, setInternalDragging] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [sliderWidth, setSliderWidth] = useState(0);

    // --- Effects ---
    useEffect(() => {
        const sliderElement = sliderRef.current;
        if (!sliderElement) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setSliderWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(sliderElement);
        setSliderWidth(sliderElement.offsetWidth);

        return () => {
            if (sliderElement) {
                resizeObserver.unobserve(sliderElement);
            }
        };
    }, []);

    useEffect(() => {
        const checkTouchDevice = () => setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        checkTouchDevice();
        window.addEventListener('resize', checkTouchDevice);
        return () => window.removeEventListener('resize', checkTouchDevice);
    }, []);

    // This effect handles hiding the tooltip after a drag has ended and the user is not hovering.
    useEffect(() => {
        if (!internalDragging && !isDragging) {
            const timer = setTimeout(() => {
                if (!isHovering) {
                    setHoverState(INITIAL_HOVER_STATE);
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [internalDragging, isDragging, isHovering]);

    // --- REMOVED ---
    // The following useEffect block was removed. It created a global mousemove listener
    // that fought with the primary drag effect, causing the tooltip to flicker
    // by setting isVisible to false while another effect was setting it to true.
    /*
    useEffect(() => {
        if (!internalDragging && !isDragging) return;
        const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => { ... };
        document.addEventListener('mousemove', handleGlobalMouseMove);
        ...
    }, [internalDragging, isDragging]);
    */

    // This effect correctly handles user-select style during drag
    useEffect(() => {
        const preventSelection = (e: Event) => {
            if (internalDragging || isDragging) e.preventDefault();
        };
        const disableTextSelection = () => {
            document.body.style.userSelect = (internalDragging || isDragging) ? 'none' : '';
        };
        disableTextSelection();
        if (internalDragging || isDragging) {
            document.addEventListener('selectstart', preventSelection);
        }
        return () => {
            document.removeEventListener('selectstart', preventSelection);
            document.body.style.userSelect = '';
        };
    }, [internalDragging, isDragging]);

    // --- Core Positioning & Segments --- (No changes here)
    const displayPercent = previewValue ?? value;
    const currentTime = (value / 100) * duration;
    const displayTime = (displayPercent / 100) * duration;

    const processedSegments = useMemo(() => {
        if (!duration || chapters.length === 0) return [];
        const sortedChapters = [...chapters].sort((a, b) => a.startTime - b.startTime);
        const segments = sortedChapters.map(chapter => ({ ...chapter, isChapter: true }));
        const lastChapter = sortedChapters[sortedChapters.length - 1];
        if (lastChapter.endTime < duration) {
            segments.push({ startTime: lastChapter.endTime, endTime: duration, label: '', isChapter: false });
        }
        return segments;
    }, [chapters, duration]);

    const segmentPositions = useMemo(() => {
        if (!processedSegments.length || !duration || sliderWidth === 0) return [];
        const numGaps = processedSegments.reduce((count, segment, index) => (segment.isChapter && index < processedSegments.length - 1 ? count + 1 : count), 0);
        const totalGapWidthPx = numGaps * CHAPTER_GAP_WIDTH;
        const availableWidthForSegmentsPercent = 100 - (totalGapWidthPx / sliderWidth) * 100;

        let accumulatedLeftPercent = 0;
        const positions = processedSegments.map((segment, index) => {
            const segmentDuration = segment.endTime - segment.startTime;
            const segmentWidthPercent = (segmentDuration / duration) * availableWidthForSegmentsPercent;
            const position = { leftPercent: accumulatedLeftPercent, widthPercent: segmentWidthPercent, segment, index };
            accumulatedLeftPercent += segmentWidthPercent;
            if (segment.isChapter && index < processedSegments.length - 1) {
                const gapWidthPercent = (CHAPTER_GAP_WIDTH / sliderWidth) * 100;
                accumulatedLeftPercent += gapWidthPercent;
            }
            return position;
        });

        if (positions.length > 0) {
            const lastPosition = positions[positions.length - 1];
            if (lastPosition.leftPercent < 100) {
                lastPosition.widthPercent = 100 - lastPosition.leftPercent;
            }
        }
        return positions;
    }, [processedSegments, duration, sliderWidth]);

    const currentSegmentIndex = useMemo(() => processedSegments.findIndex(s => currentTime >= s.startTime && currentTime < s.endTime), [processedSegments, currentTime]);
    const displaySegmentIndex = useMemo(() => processedSegments.findIndex(s => displayTime >= s.startTime && displayTime < s.endTime), [processedSegments, displayTime]);

    // --- Helper Functions (Positioning) --- (No changes here)
    const getVisualPositionFromTime = useCallback((time: number): number => {
        if (segmentPositions.length === 0 || !duration) return duration > 0 ? (time / duration) * 100 : 0;
        let segmentIndex = segmentPositions.findIndex(p => time < p.segment.endTime);
        if (segmentIndex === -1) segmentIndex = segmentPositions.length - 1;

        const segmentInfo = segmentPositions[segmentIndex];
        const { segment, leftPercent, widthPercent } = segmentInfo;
        const segmentDuration = segment.endTime - segment.startTime;
        if (segmentDuration <= 0) return leftPercent;

        const clampedTime = Math.max(segment.startTime, Math.min(time, segment.endTime));
        const progressInSegment = (clampedTime - segment.startTime) / segmentDuration;
        return leftPercent + (progressInSegment * widthPercent);
    }, [segmentPositions, duration]);

    const getTimeFromVisualPosition = useCallback((clientX: number): number => {
        const slider = sliderRef.current;
        if (!slider || !duration) return 0;

        const rect = slider.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const clickPercent = (x / rect.width) * 100;

        if (segmentPositions.length === 0) return (clickPercent / 100) * duration;

        for (let i = 0; i < segmentPositions.length; i++) {
            const currentPos = segmentPositions[i];
            const segmentStartPercent = currentPos.leftPercent;
            const segmentEndPercent = segmentStartPercent + currentPos.widthPercent;

            if (clickPercent >= segmentStartPercent && clickPercent <= segmentEndPercent) {
                const progressInVisualSegment = (clickPercent - segmentStartPercent) / currentPos.widthPercent;
                const segmentDuration = currentPos.segment.endTime - currentPos.segment.startTime;
                return isNaN(progressInVisualSegment) ? currentPos.segment.startTime : currentPos.segment.startTime + (progressInVisualSegment * segmentDuration);
            }

            const nextPos = segmentPositions[i + 1];
            if (nextPos && currentPos.segment.isChapter) {
                const gapStartPercent = segmentEndPercent;
                const gapEndPercent = nextPos.leftPercent;
                if (clickPercent > gapStartPercent && clickPercent < gapEndPercent) {
                    return nextPos.segment.startTime;
                }
            }
        }
        return duration;
    }, [segmentPositions, duration]);

    const getSegmentAtPosition = useCallback((clientX: number): number | null => {
        if (!sliderRef.current || !segmentPositions.length) return null;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const clickPercent = (x / rect.width) * 100;
        const position = segmentPositions.find(p => clickPercent >= p.leftPercent && clickPercent <= p.leftPercent + p.widthPercent);
        return position ? position.index : null;
    }, [segmentPositions]);

    // --- Update thumb position --- (No changes here)
    useEffect(() => {
        if (thumbRef.current) {
            thumbRef.current.style.left = `${getVisualPositionFromTime(displayTime)}%`;
        }
    }, [displayTime, getVisualPositionFromTime]);

    useEffect(() => {
        setDragSegmentIndex((internalDragging || isDragging) ? displaySegmentIndex : null);
    }, [internalDragging, isDragging, displaySegmentIndex]);

    // This effect correctly updates the tooltip during a drag.
    useEffect(() => {
        if (internalDragging || isDragging) {
            const time = displayTime;
            const visualPosition = getVisualPositionFromTime(time);
            const vtt = vttCues.find(c => time >= c.startTime && time < c.endTime) || null;
            const chapter = chapters.find(c => time >= c.startTime && time < c.endTime) || null;
            const highlight = highlights.find(h => Math.abs(h.time - time) <= 2) || null;

            setHoverState({
                isVisible: !isTouchDevice, // This will now correctly keep the tooltip visible
                leftPercentage: visualPosition,
                time,
                vttCue: vtt,
                activeChapter: chapter,
                activeHighlight: highlight
            });
        }
    }, [internalDragging, isDragging, displayTime, getVisualPositionFromTime, vttCues, chapters, highlights, isTouchDevice]);

    // --- Event Handlers ---
    const getClientCoordinates = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
        const touch = 'touches' in e ? (e.touches[0] || e.changedTouches[0]) : null;
        // @ts-ignore
        return { clientX: touch ? touch.clientX : e.clientX, clientY: touch ? touch.clientY : e.clientY };
    }, []);

    const getPercentFromEvent = useCallback((e: MouseEvent | TouchEvent): number => {
        const { clientX } = getClientCoordinates(e);
        const time = getTimeFromVisualPosition(clientX);
        return (time / duration) * 100;
    }, [getTimeFromVisualPosition, duration, getClientCoordinates]);

    const handleInternalDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setInternalDragging(true);
        onDragStart?.();
        onChange(getPercentFromEvent(e.nativeEvent));

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
            moveEvent.preventDefault();
            onChange(getPercentFromEvent(moveEvent));
        };

        const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchcancel', handleEnd);

            // --- FIXED: Check if the drag ended outside the slider ---
            const slider = sliderRef.current;
            if (slider) {
                const rect = slider.getBoundingClientRect();
                const { clientX, clientY } = getClientCoordinates(endEvent);
                const isOutside = clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;

                if (isOutside) {
                    // If dropped outside, we are no longer hovering and should hide the tooltip.
                    setIsHovering(false);
                    setHoverState(INITIAL_HOVER_STATE);
                }
            }
            // --- END OF FIX ---

            onDragEnd(getPercentFromEvent(endEvent));
            setInternalDragging(false);
        };

        window.addEventListener('mousemove', handleMove, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleEnd, { passive: false });
        window.addEventListener('touchend', handleEnd, { passive: false });
        window.addEventListener('touchcancel', handleEnd, { passive: false });
    }, [getPercentFromEvent, onChange, onDragStart, onDragEnd, getClientCoordinates]);

    const updateHoverState = useCallback((clientX: number) => {
        if (!sliderRef.current || duration <= 0 || isTouchDevice) return;
        const time = getTimeFromVisualPosition(clientX);
        const visualPosition = getVisualPositionFromTime(time);
        const vtt = vttCues.find(c => time >= c.startTime && time < c.endTime) || null;
        const chapter = chapters.find(c => time >= c.startTime && time < c.endTime) || null;
        const highlight = highlights.find(h => Math.abs(h.time - time) <= 2) || null;
        setHoverState({
            isVisible: true,
            leftPercentage: visualPosition, time, vttCue: vtt,
            activeChapter: chapter, activeHighlight: highlight
        });
        setHoveredSegmentIndex(getSegmentAtPosition(clientX));
    }, [duration, vttCues, chapters, highlights, getTimeFromVisualPosition, getVisualPositionFromTime, getSegmentAtPosition, isTouchDevice]);

    const throttledUpdateHoverState = useThrottledCallback(updateHoverState, 16, { trailing: true });

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;
        setIsHovering(true);
        throttledUpdateHoverState(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;
        throttledUpdateHoverState(e.clientX);
    };

    const handleMouseLeave = () => {
        if (internalDragging || isDragging) return; // This guard is still essential
        if (isTouchDevice) return;
        throttledUpdateHoverState.cancel();
        setIsHovering(false);
        setHoveredSegmentIndex(null);
        setHoverState(INITIAL_HOVER_STATE);
    };


    // --- Rendering Logic --- (No changes here)
    const getTooltipPosition = useCallback(() => {
        const leftPercent = hoverState.leftPercentage;
        let transform = 'translateX(-50%)';
        if (leftPercent < 15) transform = 'translateX(0)';
        else if (leftPercent > 85) transform = 'translateX(-100%)';
        return { left: `${leftPercent}%`, transform };
    }, [hoverState.leftPercentage]);

    const getSegmentScale = useCallback((segmentIndex: number) => {
        const isDragActive = internalDragging || isDragging;
        if (isDragActive && dragSegmentIndex === segmentIndex) return 1;
        if (hoveredSegmentIndex === segmentIndex && isHovering && !isTouchDevice) return 1;
        if (currentSegmentIndex === segmentIndex && !isDragActive && (!isHovering || isTouchDevice)) return 0.7;
        return 0.5;
    }, [internalDragging, isDragging, currentSegmentIndex, hoveredSegmentIndex, dragSegmentIndex, isHovering, isTouchDevice]);

    const getSegmentFill = useCallback((segment: SliderChapter) => {
        const isInteracting = internalDragging || isDragging || previewValue !== null;
        const relevantTime = isInteracting ? displayTime : currentTime;
        if (relevantTime <= segment.startTime) return 0;
        if (relevantTime >= segment.endTime) return 100;
        const segmentDuration = segment.endTime - segment.startTime;
        const timeInSegment = relevantTime - segment.startTime;
        return segmentDuration > 0 ? (timeInSegment / segmentDuration) * 100 : 0;
    }, [currentTime, displayTime, internalDragging, isDragging, previewValue]);

    const TooltipContent = useMemo(() => {
        if (isTouchDevice || !hoverState.isVisible) return null;
        const hasThumbnail = !!(hoverState.vttCue && spriteDimensionsMap[hoverState.vttCue.spriteUrl]);
        const label = hoverState.activeChapter?.label || hoverState.activeHighlight?.label;
        return (
            <div className="flex flex-col items-center rounded-xl ackdrop-blur-md text-white bg-zinc-900/95 border border-zinc-700/50 shadow-2xl shadow-black/15 backdrop-blur-md overflow-hidden">
                {hasThumbnail && (
                    <div style={{
                        backgroundImage: `url(${hoverState.vttCue!.spriteUrl})`,
                        width: `${hoverState.vttCue!.w * THUMBNAIL_SCALE_FACTOR}px`,
                        height: `${hoverState.vttCue!.h * THUMBNAIL_SCALE_FACTOR}px`,
                        backgroundSize: `${spriteDimensionsMap[hoverState.vttCue!.spriteUrl].width * THUMBNAIL_SCALE_FACTOR}px ${spriteDimensionsMap[hoverState.vttCue!.spriteUrl].height * THUMBNAIL_SCALE_FACTOR}px`,
                        backgroundPosition: `-${hoverState.vttCue!.x * THUMBNAIL_SCALE_FACTOR}px -${hoverState.vttCue!.y * THUMBNAIL_SCALE_FACTOR}px`
                    }} />
                )}
                {hasThumbnail && label && (
                    <div className="py-1 px-3 text-center whitespace-nowrap">
                        <span className="text-sm font-bold">{label}</span>
                    </div>
                )}
                <div className={cn("px-3 text-center whitespace-nowrap", hasThumbnail ? "pb-1 text-xs" : "py-1.5 text-sm font-semibold")}>
                    <span>{FormatTime(hoverState.time)}</span>
                </div>
            </div>
        );
    }, [hoverState, spriteDimensionsMap, isTouchDevice]);

    const tooltipPosition = getTooltipPosition();
    const isInteracting = internalDragging || isDragging || previewValue !== null;

    // --- JSX --- (No changes here)
    return (
        <div className={cn("relative w-full h-2 flex flex-col justify-end items-center", className)}>
            {!isTouchDevice && (
                <div
                    style={{ left: tooltipPosition.left, transform: tooltipPosition.transform }}
                    className={cn('absolute bottom-full mb-3 flex flex-col items-center pointer-events-none transition-opacity duration-150 z-40',
                        hoverState.isVisible ? 'opacity-100' : 'opacity-0'
                    )}
                >
                    {TooltipContent}
                </div>
            )}
            <div
                ref={sliderRef}
                onMouseDown={handleInternalDragStart}
                onTouchStart={handleInternalDragStart}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn("relative w-full h-6 flex group cursor-pointer items-center select-none touch-none", isTouchDevice ? "active:scale-[1.02] transition-transform" : "")}
                style={{ touchAction: 'none' }}
            >
                {/* ... rest of JSX is unchanged ... */}
                <div className="absolute w-full h-full flex items-center">
                    <div className="relative w-full h-full flex items-center">
                        {segmentPositions.length > 0 ? (
                            <div className="relative w-full h-full flex items-center">
                                {segmentPositions.map((position, index) => {
                                    const segment = position.segment;
                                    const segmentScale = getSegmentScale(index);
                                    const fillAmount = getSegmentFill(segment);

                                    return (
                                        <React.Fragment key={`segment-${index}`}>
                                            <div className="relative" style={{ width: `${position.widthPercent}%` }}>
                                                <div
                                                    className="relative w-full bg-white/30 overflow-hidden transition-all duration-300 ease-out transform-gpu"
                                                    style={{ height: `${12 * segmentScale}px`, transformOrigin: 'center' }}>
                                                    <div
                                                        className={cn('absolute h-full z-10', progressColor, (internalDragging || isDragging) ? '' : 'transition-all duration-150 ease-out')}
                                                        style={{ width: `${fillAmount}%` }}/>
                                                </div>
                                            </div>
                                            {segment.isChapter && index < segmentPositions.length - 1 && (
                                                <div style={{ width: `${CHAPTER_GAP_WIDTH}px` }} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        ) : (
                            <div
                                className="relative w-full transition-all duration-300 ease-out rounded-full bg-white/30 transform-gpu"
                                style={{
                                    height: `${4 * (isHovering && !isTouchDevice ? 1.5 : 1)}px`,
                                    transformOrigin: 'center'
                                }}>
                                <div
                                    style={{ width: `${isInteracting ? displayPercent : value}%` }}
                                    className={cn('absolute h-full rounded-full z-10', progressColor, (internalDragging || isDragging) ? '' : 'transition-all duration-150 ease-out')}/>
                            </div>
                        )}

                        <div className="absolute w-full h-full top-0 left-0 pointer-events-none z-20">
                            {highlights.map((marker, index) => (
                                <div
                                    key={`highlight-${index}`}
                                    className="absolute top-1/2 w-1.5 h-1.5 rounded-full ring-1 ring-black/50"
                                    style={{
                                        left: `${getVisualPositionFromTime(marker.time)}%`,
                                        backgroundColor: marker.color || '#ffc107',
                                        transform: `translate(-50%, -50%) scale(${(isHovering && !isTouchDevice) ? 1.2 : 1})`
                                    }}/>
                            ))}
                        </div>
                        <div
                            ref={thumbRef}
                            style={{ transform: 'translate(-50%, -50%)', top: '50%' }}
                            className={cn('absolute h-3.5 w-3.5 rounded-full pointer-events-none ring-white shadow z-30',
                                progressColor,
                                (internalDragging || isDragging) ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
                            )}/>
                    </div>
                </div>
            </div>
        </div>
    );
});

Slider.displayName = 'Slider';
