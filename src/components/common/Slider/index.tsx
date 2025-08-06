import React, { useRef, useEffect, useCallback, useState } from 'react';
import {cn} from "@/utils/cn";

interface CustomSliderProps {
    value: number;
    previewValue?: number | null;
    onChange: (newValue: number) => void;
    onDragStart?: () => void;
    onDragEnd: (finalValue: number) => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    progressBgColor?: string,
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
                                                                         progressBgColor = 'bg-white/30',
                                                                         progressColor = 'slider-track-primary',
                                                                         previewColor = 'bg-white/50',
                                                                     }) => {
    const isVertical = orientation === 'vertical';
    const sliderRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const filledProgressRef = useRef<HTMLDivElement>(null);
    const previewProgressRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const thumbPosition = previewValue ?? value;

    // --- FIX START: The logic inside this useEffect is now corrected for both orientations ---
    useEffect(() => {
        requestAnimationFrame(() => {
            if (thumbRef.current) {
                const percentage = Math.max(0, Math.min(thumbPosition, 100));

                if (isVertical) {
                    // Correct positioning for VERTICAL slider
                    thumbRef.current.style.left = '50%';
                    thumbRef.current.style.bottom = `${percentage}%`;
                    thumbRef.current.style.transform = `translate(-50%, ${percentage}%)`;
                } else {
                    // Correct positioning for HORIZONTAL slider
                    thumbRef.current.style.top = '50%'; // Use 'top' for vertical centering
                    thumbRef.current.style.left = `${percentage}%`;
                    thumbRef.current.style.transform = `translate(-${percentage}%, -50%)`;
                }
            }
        });
    }, [thumbPosition, isVertical]);
    // --- FIX END ---

    // Effects for progress bars remain the same
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


    // All handler logic remains unchanged
    const getNewValueFromEvent = useCallback((event: MouseEvent | TouchEvent): number => {
        if (!sliderRef.current) return 0;
        const rect = sliderRef.current.getBoundingClientRect();
        const touch = 'touches' in event ? event.touches[0] : event;
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

    const handleDragStart = useCallback((startEvent: React.MouseEvent | React.TouchEvent) => {
        startEvent.stopPropagation();
        setIsDragging(true);
        onDragStart?.();
        const initialValue = getNewValueFromEvent(startEvent.nativeEvent);
        onChange(initialValue);
        const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
            if (moveEvent.cancelable) moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const newValue = getNewValueFromEvent(moveEvent);
            onChange(newValue);
        };
        const handleDragEnd = (endEvent: MouseEvent | TouchEvent) => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
            setIsDragging(false);
            const finalValue = getNewValueFromEvent(endEvent);
            onDragEnd(finalValue);
        };
        window.addEventListener('mousemove', handleDragMove, { passive: false });
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    }, [getNewValueFromEvent, onChange, onDragStart, onDragEnd]);

    const containerClasses = isVertical ? 'w-5 h-full flex-col-reverse' : 'w-full h-5 flex-row';
    const trackClasses = isVertical ? 'w-1.5 h-full' : 'h-1 w-full group-hover:h-1.5 transition-all duration-200';

    return (
        <div
            ref={sliderRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className={cn('relative flex cursor-pointer group touch-none items-center justify-center', containerClasses, className)}
            role="slider"
            aria-orientation={orientation}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(thumbPosition)}
        >
            <div className={cn('relative rounded-full', progressBgColor, trackClasses)}>
                <div
                    ref={previewProgressRef}
                    className={cn('absolute rounded-full', previewColor, isVertical ? 'w-full bottom-0' : 'h-full left-0')}
                />
                <div
                    ref={filledProgressRef}
                    className={cn('absolute rounded-full', progressColor, isVertical ? 'w-full bottom-0' : 'h-full left-0')}
                />
                <div
                    ref={thumbRef}
                    className={cn(
                        'absolute h-2.5 w-2.5 rounded-full pointer-events-none ring-2 ring-white shadow-md',
                        progressColor,
                        'transition-transform duration-150',
                        'group-hover:scale-110',
                        isDragging ? 'scale-125' : '',
                    )}
                />
            </div>
        </div>
    );
});

Slider.displayName = 'Slider';
