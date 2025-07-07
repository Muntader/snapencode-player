// src/player/ui/controls/QualityPanel.tsx

import React, { useMemo } from 'react';
import { useTracks } from '@/player/hooks/useTracks';
import { cn } from '@/player/utils/cn';
import { Icons } from '../../common/Icon';
import {formatBitrate, getQualityInfo, QualityBadge} from "@/player/utils/quality";
// Import our new, powerful helpers

interface QualityPanelProps {
    showBitrate?: boolean;
}

// Helper to get CSS classes for different badge styles
const getBadgeClasses = (style: QualityBadge['style']) => {
    switch (style) {
        case 'hdr':
            return 'rounded bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm';
        case 'vr':
            return 'rounded bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-sm';
        case 'default':
        default:
            return 'rounded bg-slate-200 text-slate-600';
    }
};

const QualityPanel: React.FC<QualityPanelProps> = React.memo(({ showBitrate = true }) => {
    const { videoTracks, selectedVideoTrackId, isAbrEnabled, selectVideoQuality, enableAutoABR } = useTracks();

    const uniqueSortedTracks = useMemo(() => {
        if (!videoTracks) return [];
        const trackMap = new Map();
        videoTracks.forEach((track: any) => {
            if (track.width && !trackMap.has(track.width)) {
                trackMap.set(track.width, track);
            }
        });
        return Array.from(trackMap.values()).sort((a, b) => b.width - a.width);
    }, [videoTracks]);

    if (uniqueSortedTracks.length <= 1) {
        return null;
    }

    const MenuItem = ({ onClick, isSelected, children, title }: { onClick: () => void; isSelected: boolean; children: React.ReactNode; title?: string; }) => (
        <button role="menuitemradio" onClick={onClick} aria-checked={isSelected} title={title} className={cn('flex w-full cursor-pointer items-center justify-between rounded-md py-2 px-2.5 text-left text-sm transition-colors duration-150 ease-in-out hover:bg-slate-100 focus:bg-slate-100 focus:outline-none', isSelected ? 'font-semibold text-blue-600' : 'text-slate-600' )}>
            {children}
            {isSelected && <Icons.CheckIcon className="h-5 w-5 flex-shrink-0" />}
        </button>
    );

    return (
        <div className="w-full">
            <MenuItem onClick={enableAutoABR} isSelected={isAbrEnabled} title="Automatically adjust quality">
                <div className="flex items-center gap-2">
                    <span>Auto</span>
                    {isAbrEnabled && (
                        <span className="text-xs font-normal text-slate-400">
                           ({getQualityInfo(videoTracks.find(t => t.active)).label})
                        </span>
                    )}
                </div>
            </MenuItem>

            <hr className="my-1 border-slate-200" />

            {uniqueSortedTracks.map((track) => {
                const quality = getQualityInfo(track);
                const isSelected = !isAbrEnabled && selectedVideoTrackId === track.id;

                return (
                    <MenuItem key={track.id} onClick={() => selectVideoQuality(track.id)} isSelected={isSelected} title={`Resolution: ${quality.resolution}`}>
                        <div className="flex items-center gap-2">
                            <span>{quality.label}</span>

                            <div className="flex items-center gap-1.5">
                                {/* DYNAMIC BADGE RENDERING */}
                                {quality.badges.map((badge) => (
                                    <span key={badge.text} className={cn('px-1.5 py-0.5 text-[10px] font-bold', getBadgeClasses(badge.style))}>
                                        {badge.text}
                                    </span>
                                ))}

                                {showBitrate && (
                                    <span className="text-xs font-normal text-slate-500">
                                        {formatBitrate(track.bandwidth)}
                                    </span>
                                )}
                            </div>
                        </div>

                    </MenuItem>
                );
            })}
        </div>
    );
});

export default QualityPanel;
