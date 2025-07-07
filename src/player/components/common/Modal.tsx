// src/player/components/common/Modal.tsx

import React, { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useModal } from '@/player/store/useModalStore';
// useOnClickOutside is no longer needed for desktop, we can remove it or keep for mobile if logic differs.
// Let's remove it for now to show the new pattern.
// import { useOnClickOutside } from '@/player/hooks/useOnClickOutside';
import { useDeviceInfo } from '@/player/hooks/useDeviceInfo';
import { Icons } from '@/player/components/common/Icon';
import { cn } from '@/player/utils/cn';

// ... (calculateModalPosition function remains the same, no changes needed there)
const calculateModalPosition = (data: {
    triggerRect: DOMRect;
    playerRect: DOMRect;
    popupWidth: number;
}): CSSProperties => {
    // ... (no changes in this function)
    const { triggerRect, playerRect, popupWidth } = data;
    const triggerRelativeToPlayer = {
        top: triggerRect.top - playerRect.top,
        left: triggerRect.left - playerRect.left,
        right: triggerRect.right - playerRect.left,
    };
    const style: CSSProperties = {
        position: 'absolute',
        zIndex: 50, // Keep this high so it's above the new backdrop
        width: popupWidth,
    };
    const padding = 8;
    const spaceLeft = triggerRelativeToPlayer.left;
    const spaceRight = playerRect.width - triggerRelativeToPlayer.right;

    if (spaceRight >= popupWidth) {
        style.left = triggerRelativeToPlayer.left;
    } else if (spaceLeft >= popupWidth) {
        style.left = triggerRelativeToPlayer.right - popupWidth;
    } else {
        const availableWidth = playerRect.width - 16;
        style.left = Math.max(8, triggerRelativeToPlayer.left - (popupWidth - triggerRect.width) / 2);
        if (popupWidth > availableWidth) {
            style.width = availableWidth;
            style.left = 8;
        }
    }

    const DESIRED_MAX_HEIGHT = 600;
    const availableHeightInPlayer = triggerRelativeToPlayer.top - padding;
    style.maxHeight = Math.min(DESIRED_MAX_HEIGHT, availableHeightInPlayer);
    style.bottom = playerRect.height - triggerRelativeToPlayer.top + padding;

    return style;
};


const DEFAULT_MODAL_WIDTH = 300;

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
            requestAnimationFrame(() => setIsAnimatingIn(true));
        } else {
            setIsAnimatingIn(false);
            const timer = setTimeout(() => setIsMounted(false), 200);
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
        return () => window.removeEventListener('resize', repositionModal);
    }, [isOpen, isMounted, triggerRef, content, width, deviceInfo.isDesktop]);

    // --- REMOVED ---
    // The useOnClickOutside hook is no longer needed as the backdrop handles it.
    // useOnClickOutside(popupRef, closeModal, triggerRef);

    if (!isMounted) {
        return null;
    }

    const animationClasses = cn({
        'opacity-100 scale-100': isAnimatingIn,
        'opacity-0 scale-95': !isAnimatingIn,
    });

    if (deviceInfo.isDesktop) {
        return (
            // Use a Fragment to return two sibling elements: the backdrop and the modal
            <>
                {/* --- 1. ADD THE BACKDROP --- */}
                {/* This div covers the whole player, sits behind the modal (z-40 vs z-50),
                    and intercepts the "outside" click. It's transparent. */}
                <div
                    className="absolute inset-0 z-40 bg-transparent"
                    onClick={() => closeModal()}
                />

                {/* --- 2. THE MODAL ITSELF --- */}
                {/* No changes here, but note its z-index is 50, so it appears on top of the backdrop */}
                <div
                    ref={popupRef}
                    style={style}
                    className={cn(
                        'rounded-xl bg-white/95 shadow-2xl backdrop-blur-m flex flex-col',
                        'transform-gpu transition-all duration-200 ease-out origin-bottom',
                        animationClasses
                    )}
                >
                    <div className="overflow-y-auto overflow-x-hidden">
                        {content}
                    </div>
                </div>
            </>
        );
    }

    // --- MOBILE VIEW (already has a backdrop, no changes needed) ---
    return (
        <div
            // This outer div acts as the backdrop for mobile
            className={cn("absolute inset-0 z-50 flex bg-black/60 backdrop-blur-sm", animationClasses)}
            onClick={(e) => {
                // Ensure clicks on the modal content itself don't close it
                if (e.target === e.currentTarget) {
                    closeModal();
                }
            }}
        >
            <div
                ref={popupRef}
                className={cn(
                    // Added `pointer-events-auto` just in case to ensure clicks inside are captured.
                    "relative m-auto w-full max-w-md overflow-y-auto overflow-x-hidden bg-white/95 shadow-2xl rounded-xl pointer-events-auto",
                    "transform transition-transform duration-300 ease-out",
                    deviceInfo.isMobilePortrait ? "mx-4 my-auto max-h-[85vh]" : "mx-8 my-auto max-h-[90vh]",
                    { 'translate-y-0': isAnimatingIn, 'translate-y-10': !isAnimatingIn }
                )}
            >
                <button
                    onClick={closeModal}
                    className="absolute right-3 top-1.5 z-20 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-200/60 bg-white/80"
                    aria-label="Close modal"
                >
                    <Icons.CloseIcon className="h-5 w-5" />
                </button>
                <div className="p-1">{content}</div>
            </div>
        </div>
    );
};
