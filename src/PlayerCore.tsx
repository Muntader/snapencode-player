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
// ============================================================================

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

const parseColorToRgb = (color: string | undefined): string | null => {
    if (!color) return null;
    if (typeof document === 'undefined') return null;
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

type PlayerStyles = React.CSSProperties & {
    '--theme-primary-rgb'?: string;
    '--theme-font'?: string;
    '--caption-bg-color'?: string;
    '--caption-text-color'?: string;
    '--caption-font-family'?: string;
    '--caption-font-size'?: string;
    '--caption-edge-style'?: string;
    '--caption-font-weight'?: number | string;
    '--caption-font-style'?: string;
};

export const PlayerCore: React.FC = () => {
    const { setPlayback, containerRef, adContainerRef } = useBitbyte3Player();
    const { error, isAdPlaying } = usePlayerStateStore(
        useShallow(state => ({ error: state.error, isAdPlaying: state.isAdPlaying }))
    );
    const configuration = usePlayerConfigStore(state => state.configuration);
    const uiConfig = configuration?.ui;

    usePlayerEngine();

    const getLogoPositionClass = (): string => {
        switch (uiConfig?.layout?.logoPosition) {
            case 'top-left':
                return 'top-4 left-4';
            case 'bottom-left':
                return 'bottom-[60px] md:bottom-[70px] left-4';
            case 'bottom-right':
                return 'bottom-[60px] md:bottom-[70px] right-4';
            case 'top-right':
            default:
                return 'top-4 right-4';
        }
    };

    const playerStyles = useMemo((): PlayerStyles => {
        const styles: PlayerStyles = {};
        if (!uiConfig) return styles;

        styles.width = uiConfig.layout?.width ?? '100%';
        styles.height = uiConfig.layout?.height ?? '100%';

        if (uiConfig.theme) {
            styles.backgroundColor = uiConfig.theme.playerBackgroundColor ?? 'black';
            styles['--theme-primary-rgb'] = parseColorToRgb(uiConfig.theme.primaryColor) ?? '59 130 246';
            styles['--theme-font'] = uiConfig.theme.fontFamily ?? 'sans-serif';

            if (uiConfig.theme.captions) {
                styles['--caption-bg-color'] = uiConfig.theme.captions.backgroundColor ?? 'rgba(0, 0, 0, 0.8)';
                styles['--caption-text-color'] = uiConfig.theme.captions.textColor ?? '#FFFFFF';
                styles['--caption-font-family'] = uiConfig.theme.captions.fontFamily ?? 'sans-serif';
                styles['--caption-font-size'] = uiConfig.theme.captions.fontSize ?? '1.25rem';
                styles['--caption-edge-style'] = getEdgeStyle(uiConfig.theme.captions.edgeType);
                styles['--caption-font-weight'] = uiConfig.theme.captions.fontWeight ?? 700;
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
                ref={setPlayback}
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
