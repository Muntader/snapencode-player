// src/player/utils/quality.ts

/**
 * A comprehensive interface for a video track, including properties for VR content.
 */
interface VideoTrack {
    id: number | string;
    width: number;
    height: number;
    bandwidth: number;
    hdr?: string | null;
    // Common properties used by players like Shaka Player for VR/360° content
    projection?: 'rectilinear' | 'equirectangular' | 'cubemap' | 'mesh';
    spatialAudio?: boolean;
}

/**
 * Defines the style and text for a quality badge.
 */
export interface QualityBadge {
    text: string;
    style: 'default' | 'hdr' | 'vr';
}

/**
 * Defines the comprehensive information for a given quality level.
 */
export interface QualityInfo {
    label: string;
    resolution: string;
    badges: QualityBadge[];
}

// --- DATA-DRIVEN QUALITY TIERS ---
// This array is sorted from highest to lowest quality.
// It's easy to add new tiers (e.g., 12K) here in the future.
const QUALITY_TIERS = [
    { minWidth: 7600, label: '8K', badgeText: '8K' },
    { minWidth: 5000, label: '5K', badgeText: '5K' },
    { minWidth: 3800, label: '4K', badgeText: 'UHD' },
    { minWidth: 2500, label: '1440p', badgeText: 'QHD' },
    { minWidth: 1900, label: '1080p', badgeText: 'HD' },
    { minWidth: 1200, label: '720p', badgeText: 'HD' },
    { minWidth: 840,  label: '480p', badgeText: null },
    { minWidth: 620,  label: '360p', badgeText: null },
    { minWidth: 400,  label: '240p', badgeText: null },
    { minWidth: 0,    label: '144p', badgeText: null }, // Fallback for the smallest sizes
];

/**
 * Analyzes a video track and returns a comprehensive set of quality information.
 * This is the central function for all quality-related display logic.
 *
 * @param track - The video track object.
 * @returns An object with a user-friendly label, exact resolution, and an array of badges.
 */
export const getQualityInfo = (track: any): QualityInfo => {
    const badges: QualityBadge[] = [];

    // 1. Find the base quality tier based on width
    const tier = QUALITY_TIERS.find(t => track.width >= t.minWidth);
    let label = tier ? tier.label : `${track.height}p`; // Fallback to height if no tier matches

    if (tier?.badgeText) {
        badges.push({ text: tier.badgeText, style: 'default' });
    }

    // 2. Check for special formats like VR / 360°
    const isVR = track.projection && track.projection !== 'rectilinear';
    if (isVR) {
        label = `${label} (VR)`; // Modify label for clarity, e.g., "4K (VR)"
        badges.push({ text: 'VR', style: 'vr' });
    }

    // 3. Check for HDR
    if (track.hdr && track.hdr.toUpperCase() !== 'SDR') {
        badges.push({ text: track.hdr, style: 'hdr' });
    }

    return {
        label,
        resolution: `${track.width}x${track.height}`,
        badges,
    };
};

// Bitrate formatter remains the same
export const formatBitrate = (bits: number): string => {
    if (!bits) return '';
    if (bits >= 1000000) return `${(bits / 1000000).toFixed(1)} Mbps`;
    if (bits >= 1000) return `${Math.round(bits / 1000)} kbps`;
    return `${bits} bps`;
};
