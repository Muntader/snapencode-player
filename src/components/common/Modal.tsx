// src/player/components/common/Modal.tsx

import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useModal } from '@/store/useModalStore';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { Icons } from '@/components/common/Icon';
import { cn } from '@/utils/cn';

const calculateModalPosition = (data: {
    triggerRect: DOMRect;
    playerRect: DOMRect;
    popupWidth: number;
}): CSSProperties => {
    const { triggerRect, playerRect, popupWidth } = data;
    const triggerRelativeToPlayer = {
        top: triggerRect.top - playerRect.top,
        left: triggerRect.left - playerRect.left,
        right: triggerRect.right - playerRect.left,
    };

    const style: CSSProperties = {
        position: 'absolute',
        zIndex: 50,
        width: popupWidth,
    };

    const padding = 12; // Increased padding for better spacing
    const spaceLeft = triggerRelativeToPlayer.left;
    const spaceRight = playerRect.width - triggerRelativeToPlayer.right;

    // Horizontal positioning
    if (spaceRight >= popupWidth + padding) {
        style.left = triggerRelativeToPlayer.left;
    } else if (spaceLeft >= popupWidth + padding) {
        style.left = triggerRelativeToPlayer.right - popupWidth;
    } else {
        // Center the modal if neither side has enough space
        const availableWidth = playerRect.width - (padding * 2);
        style.left = Math.max(padding, triggerRelativeToPlayer.left - (popupWidth - triggerRect.width) / 2);
        if (popupWidth > availableWidth) {
            style.width = availableWidth;
            style.left = padding;
        }
    }

    // Vertical positioning - always position above the trigger
    const DESIRED_MAX_HEIGHT = 480; // Reduced for better fit
    const availableHeightInPlayer = triggerRelativeToPlayer.top - padding;
    style.maxHeight = Math.min(DESIRED_MAX_HEIGHT, availableHeightInPlayer);
    style.bottom = playerRect.height - triggerRelativeToPlayer.top + padding;

    return style;
};

const DEFAULT_MODAL_WIDTH = 320; // Increased to match our menu design

export const ModalContainer: React.FC = () => {
    const { isOpen, content, triggerRef, closeModal, width } = useModal();
    const popupRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);
    const deviceInfo = useDeviceInfo();

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            // Small delay for smooth animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsAnimatingIn(true));
            });
        } else {
            setIsAnimatingIn(false);
            const timer = setTimeout(() => setIsMounted(false), 300); // Increased for smoother exit
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useLayoutEffect(() => {
        if (!isOpen || !isMounted || !triggerRef?.current || !deviceInfo.isDesktop) return;

        const repositionModal = () => {
            const triggerElement = triggerRef.current;
            if (!triggerElement) return;

            const playerContainer = triggerElement.closest('.bitbyte3-player-container');
            const playerRect = playerContainer?.getBoundingClientRect();
            if (!playerRect) return;

            const newStyle = calculateModalPosition({
                triggerRect: triggerElement.getBoundingClientRect(),
                playerRect,
                popupWidth: width || DEFAULT_MODAL_WIDTH,
            });
            setStyle(newStyle);
        };

        repositionModal();
        window.addEventListener('resize', repositionModal);
        window.addEventListener('scroll', repositionModal, { passive: true });

        return () => {
            window.removeEventListener('resize', repositionModal);
            window.removeEventListener('scroll', repositionModal);
        };
    }, [isOpen, isMounted, triggerRef, content, width, deviceInfo.isDesktop]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeModal();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, closeModal]);

    if (!isMounted) {
        return null;
    }

    const animationClasses = cn(
        'transform-gpu transition-all duration-300 ease-out',
        {
            'opacity-100 scale-100 translate-y-0': isAnimatingIn,
            'opacity-0 scale-95 translate-y-2': !isAnimatingIn,
        }
    );

    if (deviceInfo.isDesktop) {
        return (
            <>
                {/* Desktop Backdrop - subtle overlay */}
                <div
                    className="absolute inset-0 z-40 bg-black/10 backdrop-blur-[1px] transition-opacity duration-300"
                    style={{
                        opacity: isAnimatingIn ? 1 : 0,
                        pointerEvents: isAnimatingIn ? 'auto' : 'none'
                    }}
                    onClick={closeModal}
                    aria-hidden="true"
                />

                {/* Desktop Modal */}
                <div
                    ref={popupRef}
                    style={style}
                    className={cn(
                        // Modern glass-morphism design matching our settings menu
                        'relative backdrop-blur-xl bg-zinc-900/95 border border-zinc-700/50',
                        'rounded-xl shadow-2xl shadow-black/25',
                        'flex flex-col overflow-hidden',
                        // Enhanced animations
                        'origin-bottom-left',
                        animationClasses
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Settings menu"
                >
                    {/* Content wrapper with proper scrolling */}
                    <div className="relative overflow-hidden">
                        <div className="max-h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 overflow-x-hidden">
                            {content}
                        </div>

                        {/* Subtle gradient overlays for better content integration */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                    </div>
                </div>
            </>
        );
    }

    // Mobile Modal - Full modern redesign
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-end justify-center",
                "bg-black/60 backdrop-blur-sm",
                "transition-all duration-300 ease-out",
                animationClasses
            )}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closeModal();
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings menu"
        >
            <div
                ref={popupRef}
                className={cn(
                    // Modern mobile modal design
                    "relative w-full mx-4 mb-4 max-w-md",
                    "backdrop-blur-xl bg-zinc-900/95 border border-zinc-700/50",
                    "rounded-2xl shadow-2xl shadow-black/40",
                    "overflow-hidden",
                    // Mobile-specific sizing
                    "max-h-[85vh]",
                    // Smooth mobile animations
                    "transform transition-all duration-300 ease-out",
                    {
                        'translate-y-0 scale-100': isAnimatingIn,
                        'translate-y-6 scale-95': !isAnimatingIn,
                    }
                )}
            >
                {/* Mobile close button - modernized */}
                <button
                    onClick={closeModal}
                    className={cn(
                        "absolute right-3 top-3 z-20",
                        "flex h-8 w-8 items-center justify-center",
                        "rounded-full backdrop-blur-sm bg-white/10 border border-white/20",
                        "text-white/80 transition-all duration-200",
                        "hover:bg-white/20 hover:text-white hover:scale-105",
                        "focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent",
                        "active:scale-95"
                    )}
                    aria-label="Close settings"
                >
                    <Icons.CloseIcon className="h-4 w-4" />
                </button>

                {/* Mobile content with proper padding and scrolling */}
                <div className="relative">
                    <div className="max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                        <div className="pt-2 pb-4">
                            {content}
                        </div>
                    </div>

                    {/* Mobile gradient overlays */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-zinc-900/95 to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
};
