import React, { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBitbyte3Player } from './core/PlayerProvider';
import { usePlayerConfigStore } from './store/usePlayerConfigStore';
import { usePlayerStateStore } from './store/usePlayerStateStore';
import { usePlayerEngine } from './core/engine/shaka-engine';
import ControlsOverlay from './components/layouts/ControlsOverlay';
import ErrorDisplay from './components/layouts/ErrorDisplay';
import { CaptionTheme } from './types';
import {ModalContainer} from "@/components/common/Modal";

// ============================================================================
// Style Helper Functions
// These can live in this file if they are only used here, or in a `utils` folder.
// ============================================================================

/**
 * Converts the abstract caption edgeType into a concrete CSS text-shadow value.
 * @param edgeType The edge style type from the configuration.
 * @returns A valid CSS text-shadow string.
 */
const getEdgeStyle = (edgeType: CaptionTheme['edgeType']): string => {
    switch (edgeType) {
        case 'drop-shadow':
            return '1px 1px 3px rgba(0, 0, 0, 0.8)';
        case 'raised':
            return '1px 1px 1px rgba(0, 0, 0, 0.9), 2px 2px 1px rgba(0, 0, 0, 0.3)';
        case 'uniform':
            return '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
        case 'none':
        default:
            return 'none';
    }
};

/**
 * Parses any valid CSS color string and returns the 'R G B' component string
 * required by Tailwind's CSS variable convention (e.g., for `rgb(var(--primary))`).
 * @param color The color string to parse.
 * @returns A string like "255 0 0" or null if parsing fails.
 */
const parseColorToRgb = (color: string | undefined): string | null => {
    if (!color) return null;
    // Guard for non-browser environments like Server-Side Rendering.
    if (typeof document === 'undefined') return null;

    // Use the browser's engine to compute the color, which handles all formats (hex, rgb, named, etc.).
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return rgbMatch ? `${rgbMatch[1]} ${rgbMatch[2]} ${rgbMatch[3]}` : null;
};


// ============================================================================
// PlayerCore Component
// ============================================================================

/**
 * The internal component that renders the player's DOM structure.
 * It pulls dynamic configuration from the store to apply styles and render elements.
 * It should not contain complex logic, which is delegated to hooks and other components.
 */
export const PlayerCore: React.FC = () => {
    // --- Get STABLE values from React Context (for DOM interaction) ---
    const { setPlayback, containerRef, adContainerRef } = useBitbyte3Player();

    // --- Get DYNAMIC state from Zustand stores ---
    const { error, isAdPlaying } = usePlayerStateStore(
        useShallow(state => ({ error: state.error, isAdPlaying: state.isAdPlaying }))
    );
    const configuration = usePlayerConfigStore(state => state.configuration);
    const uiConfig = configuration?.ui;

    // This hook initializes and runs the underlying Shaka player engine.
    usePlayerEngine();

    /**
     * Determines the Tailwind CSS classes for the logo's position based on the uiConfig.
     */
    const getLogoPositionClass = (): string => {
        switch (uiConfig?.layout?.logoPosition) {
            case 'top-left':
                return 'top-4 left-4';
            case 'bottom-left':
                return 'bottom-[60px] md:bottom-[70px] left-4'; // Adjust for control bar height
            case 'bottom-right':
                return 'bottom-[60px] md:bottom-[70px] right-4';
            case 'top-right':
            default:
                return 'top-4 right-4';
        }
    };

    /**
     * Memoized calculation of the player's dynamic styles.
     * This creates CSS variables that are inherited by all child components.
     */
    const playerStyles = useMemo((): React.CSSProperties => {
        const styles: React.CSSProperties = {};
        if (!uiConfig) return styles; // Return empty styles if config isn't loaded yet

        // Apply layout dimensions
        styles.width = uiConfig.layout?.width ?? '100%';
        styles.height = uiConfig.layout?.height ?? '100%';

        // Apply theme styles as CSS custom properties for cascading
        if (uiConfig.theme) {
            styles.backgroundColor = uiConfig.theme.playerBackgroundColor ?? 'black';
            // @ts-ignore - CSS Custom Properties are valid in React's style object
            styles['--theme-primary-rgb'] = parseColorToRgb(uiConfig.theme.primaryColor) ?? '59 130 246'; // Default to a nice blue
            // @ts-ignore
            styles['--theme-font'] = uiConfig.theme.fontFamily ?? 'sans-serif';

            if (uiConfig.theme.captions) {
                // @ts-ignore
                styles['--caption-bg-color'] = uiConfig.theme.captions.backgroundColor ?? 'rgba(0, 0, 0, 0.8)';
                // @ts-ignore
                styles['--caption-text-color'] = uiConfig.theme.captions.textColor ?? '#FFFFFF';
                // @ts-ignore
                styles['--caption-font-family'] = uiConfig.theme.captions.fontFamily ?? 'sans-serif';
                // @ts-ignore
                styles['--caption-font-size'] = uiConfig.theme.captions.fontSize ?? '1.25rem';
                // @ts-ignore
                styles['--caption-edge-style'] = getEdgeStyle(uiConfig.theme.captions.edgeType);
                // @ts-ignore
                styles['--caption-font-weight'] = uiConfig.theme.captions.fontWeight ?? 700;
                // @ts-ignore
                styles['--caption-font-style'] = uiConfig.theme.captions.fontStyle ?? 'normal';
            }
        }

        return styles;
    }, [uiConfig]);

    return (
        <div
            ref={containerRef}
            className="bitbyte3-player-container relative w-full h-full overscroll-none"
            style={playerStyles}
        >
            <video
                ref={setPlayback} // Connect the <video> tag to the provider
                className="video-element w-full h-full object-contain"
                playsInline
                autoPlay
            />

            {uiConfig?.layout?.logoUrl && (
                <div className={`absolute z-10 w-24 h-auto pointer-events-none ${getLogoPositionClass()}`}>
                    <img src={uiConfig.layout.logoUrl} alt="Player Logo" className="w-full h-auto" />
                </div>
            )}

            <div
                ref={adContainerRef}
                className={`ad-container absolute inset-0 z-20 ${!isAdPlaying && "pointer-events-none"}`}
            />

            <ControlsOverlay />
            <ModalContainer />

            {error && <ErrorDisplay error={error} />}
        </div>
    );
};
