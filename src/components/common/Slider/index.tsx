import React, { useRef, useEffect, useCallback, useState } from 'react';
import { cn } from "@/utils/cn";

interface CustomSliderProps {
    value: number;
    previewValue?: number | null;
    onChange: (newValue: number) => void;
    onDragStart?: () => void;
    onDragEnd: (finalValue: number) => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    // Style props now expect a CSS color string, not a Tailwind class.
    progressColor?: string;
    previewColor?: string;
}

export const Slider: React.FC<CustomSliderProps> = React.memo(({
                                                                   value,
                                                                   previewValue,
                                                                   onChange,
                                                                   onDragStart,
                                                                   onDragEnd,
                                                                   orientation = 'horizontal',
                                                                   className,
                                                                   // Default values are now CSS color strings.
                                                                   progressColor = 'slider-track-primary',
                                                                   previewColor = 'rgba(255, 255, 255, 0.6)',
                                                               }) => {
    const isVertical = orientation === 'vertical';
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const filledProgressRef = useRef<HTMLDivElement>(null);
    const previewProgressRef = useRef<HTMLDivElement>(null);

    // State for tracking interaction
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const thumbPosition = previewValue ?? value;

    // Effect for positioning the thumb (no changes needed, it's correct)
    useEffect(() => {
        requestAnimationFrame(() => {
            if (thumbRef.current) {
                const percentage = Math.max(0, Math.min(thumbPosition, 100));
                if (isVertical) {
                    thumbRef.current.style.left = '50%';
                    thumbRef.current.style.bottom = `${percentage}%`;
                    thumbRef.current.style.transform = `translate(-50%, ${percentage}%)`;
                } else {
                    thumbRef.current.style.top = '50%';
                    thumbRef.current.style.left = `${percentage}%`;
                    thumbRef.current.style.transform = `translate(-${percentage}%, -50%)`;
                }
            }
        });
    }, [thumbPosition, isVertical]);

    // Effects for updating progress bar widths/heights (no changes needed)
    useEffect(() => {
        requestAnimationFrame(() => {
            if (filledProgressRef.current) {
                filledProgressRef.current.style[isVertical ? 'height' : 'width'] = `${Math.max(0, Math.min(value, 100))}%`;
            }
        });
    }, [value, isVertical]);

    useEffect(() => {
        requestAnimationFrame(() => {
            if (previewProgressRef.current) {
                previewProgressRef.current.style[isVertical ? 'height' : 'width'] = `${Math.max(0, Math.min(previewValue ?? 0, 100))}%`;
            }
        });
    }, [previewValue, isVertical]);

    // Effect to prevent text selection during drag for better UX
    useEffect(() => {
        const disableTextSelection = () => {
            document.body.style.userSelect = isDragging ? 'none' : '';
        };
        disableTextSelection();
        return () => {
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    // --- UPDATED & IMPROVED EVENT HANDLING ---

    // A more robust way to get value from either a MouseEvent or TouchEvent
    const getNewValueFromEvent = useCallback((event: MouseEvent | TouchEvent): number => {
        if (!sliderRef.current) return 0;

        const rect = sliderRef.current.getBoundingClientRect();
        // This correctly handles `touchend` which has `changedTouches` but not `touches`
        const touch = 'touches' in event ? (event.touches[0] || event.changedTouches[0]) : event;
        if (!touch) return 0; // Guard against no touch data

        let percentage;
        if (isVertical) {
            const y = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));
            percentage = (1 - (y / rect.height)) * 100;
        } else {
            const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
            percentage = (x / rect.width) * 100;
        }
        return Math.max(0, Math.min(percentage, 100));
    }, [isVertical]);

    // Unified handler for drag start (mouse or touch)
    const handleInteractionStart = useCallback((startEvent: React.MouseEvent | React.TouchEvent) => {
        startEvent.stopPropagation();
        setIsDragging(true);
        onDragStart?.();

        // Immediately update value on first click/touch
        const initialValue = getNewValueFromEvent(startEvent.nativeEvent);
        onChange(initialValue);

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
            if (moveEvent.cancelable) moveEvent.preventDefault();
            const newValue = getNewValueFromEvent(moveEvent);
            onChange(newValue);
        };

        const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
            // Cleanup listeners from the window
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
            window.removeEventListener('touchcancel', handleEnd);

            setIsDragging(false);
            const finalValue = getNewValueFromEvent(endEvent);
            onDragEnd(finalValue);
        };

        // Attach listeners to the window for robust drag handling
        window.addEventListener('mousemove', handleMove, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
        window.addEventListener('touchcancel', handleEnd);

    }, [getNewValueFromEvent, onChange, onDragStart, onDragEnd]);

    // Handlers to control hover state for visual feedback
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const isInteracting = isDragging || isHovering;

    // Dynamic classes for container and track
    const containerClasses = isVertical ? 'w-5 h-full flex-col-reverse' : 'w-full h-5 flex-row';
    const trackClasses = isVertical ? 'w-1.5 h-full' : `h-1 w-full ${isInteracting ? 'h-1.5' : ''} transition-all duration-100`;

    return (
        <div
            ref={sliderRef}
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'relative flex cursor-pointer touch-none items-center',
                containerClasses,
                className
            )}
            role="slider"
            aria-orientation={orientation}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(thumbPosition)}
        >
            <div
                className={cn('relative rounded-full bg-white/20', trackClasses)}
                // BG color is now applied via inline style
            >
                <div
                    ref={previewProgressRef}
                    className={cn('absolute rounded-full', isVertical ? 'w-full bottom-0' : 'h-full left-0')}
                    // Preview color is now applied via inline style
                    style={{ backgroundColor: previewColor }}
                />
                <div
                    ref={filledProgressRef}
                    className={cn('absolute rounded-full', progressColor, isVertical ? 'w-full bottom-0' : 'h-full left-0')}
                />
                <div
                    ref={thumbRef}
                    className={cn(
                        'absolute h-2 w-2 rounded-full pointer-events-none ring-2 ring-white shadow-md',
                        'transition-all duration-100 ease-out',
                        progressColor,
                        // Thumb appears and scales based on interaction state
                        isInteracting ? 'opacity-100' : 'opacity-0',
                        isDragging ? 'scale-125' : 'scale-100',
                    )}
                />
            </div>
        </div>
    );
});

Slider.displayName = 'Slider';
