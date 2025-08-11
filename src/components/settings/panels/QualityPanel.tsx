import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTracks } from '@/hooks/useTracks';
import { cn } from '@/utils/cn';
import { Icons } from '../../common/Icon';
import { formatBitrate, getQualityInfo, QualityBadge } from "@/utils/quality";

interface QualityPanelProps {
    showBitrate?: boolean;
}

const getBadgeClasses = (style: QualityBadge['style']) => {
    const baseClasses = 'px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors duration-200';
    switch (style) {
        case 'hdr':
            return `${baseClasses} bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm`;
        case 'vr':
            return `${baseClasses} bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-sm`;
        case 'default':
        default:
            return `${baseClasses} bg-white/20 text-white/90`;
    }
};

const QualityPanel: React.FC<QualityPanelProps> = React.memo(({ showBitrate = true }) => {
    const { t } = useTranslation();
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
        return (
            <div className="flex items-center justify-center py-8">
                <span className="text-white/60 text-sm">{t('noQualityOptions')}</span>
            </div>
        );
    }

    const MenuItem = ({ onClick, isSelected, children, title }: {
        onClick: () => void;
        isSelected: boolean;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            role="menuitemradio"
            onClick={onClick}
            aria-checked={isSelected}
            title={title}
            className={cn(
                'flex w-full items-center justify-between rounded-lg py-3 px-3 text-left text-sm transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-98',
                isSelected ? 'bg-white/15 text-white font-medium' : 'text-white/90 hover:text-white'
            )}
        >
            {children}
            {isSelected && <Icons.CheckIcon className="h-4 w-4 flex-shrink-0 fill-current text-emerald-400" />}
        </button>
    );

    return (
        <div className="space-y-1">
            <MenuItem onClick={enableAutoABR} isSelected={isAbrEnabled} title={t('auto')}>
                <div className="flex items-center gap-2">
                    <span>{t('auto')}</span>
                    {isAbrEnabled && (
                        <span className="text-xs font-normal text-white/60">
                            ({getQualityInfo(videoTracks.find(t => t.active))?.label})
                        </span>
                    )}
                </div>
            </MenuItem>

            <div className="my-2 border-t border-white/20" />

            {uniqueSortedTracks.map((track) => {
                const quality = getQualityInfo(track);
                const isSelected = !isAbrEnabled && selectedVideoTrackId === track.id;

                return (
                    <MenuItem
                        key={track.id}
                        onClick={() => selectVideoQuality(track.id)}
                        isSelected={isSelected}
                        title={`Resolution: ${quality.resolution}`}
                    >
                        <div className="flex items-center gap-2">
                            <span>{quality.label}</span>
                            <div className="flex items-center gap-1.5">
                                {quality.badges.map((badge) => (
                                    <span key={badge.text} className={getBadgeClasses(badge.style)}>
                                        {badge.text}
                                    </span>
                                ))}
                                {showBitrate && (
                                    <span className="text-xs font-normal text-white/60">
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

