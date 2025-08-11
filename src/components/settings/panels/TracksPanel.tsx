import React from "react";
import { useTranslation } from "react-i18next";
import { useTracks } from "@/hooks/useTracks";
import { cn } from "@/utils/cn";
import { LanguageParser } from "@/utils/LanguageParser";
import { Icons } from "../../common/Icon";

interface DisplayTrack {
    id: number | string;
    label: string;
    language: string;
}

const getDetailFromLabel = (label: string): string | null => {
    const match = label.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
};

const TracksPanel: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const {
        audioTracks,
        textTracks,
        selectedAudioTrackId,
        selectedTextTrackId,
        selectAudioTrack,
        selectTextTrack,
        disableTextTrack,
    } = useTracks();

    if (audioTracks.length <= 1 && textTracks.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="text-white/60 text-sm">{t('noTracksAvailable')}</span>
            </div>
        );
    }

    const MenuItem = ({ onClick, isSelected, children }: {
        onClick: () => void;
        isSelected: boolean;
        children: React.ReactNode
    }) => (
        <button
            role="menuitemradio"
            onClick={onClick}
            aria-checked={isSelected}
            className={cn(
                "flex w-full items-center justify-between rounded-lg py-3 px-3 text-left text-sm transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-98",
                isSelected ? "bg-white/15 text-white font-medium" : "text-white/90 hover:text-white"
            )}
        >
            {children}
            {isSelected && <Icons.CheckIcon className="h-4 w-4 flex-shrink-0 fill-current text-emerald-400" />}
        </button>
    );

    const renderTrackItem = (track: DisplayTrack) => {
        const languageName = LanguageParser(track.language, "en");
        const detail = getDetailFromLabel(track.label);

        return (
            <div className="flex w-full items-center justify-between">
                <span>{languageName}</span>
                {detail && (
                    <span className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white/90">
                        {detail}
                    </span>
                )}
            </div>
        );
    };

    const hasMultipleColumns = audioTracks.length > 1 && textTracks.length > 0;

    return (
        <div className={cn(
            "space-y-6",
            hasMultipleColumns && "grid grid-cols-1 gap-6 space-y-0 sm:grid-cols-2"
        )}>
            {audioTracks.length > 1 && (
                <div className="space-y-2">
                    <h4 className="px-3 text-xs font-bold text-white/80 uppercase tracking-wide">
                        {t('audio')}
                    </h4>
                    <div className="space-y-1">
                        {audioTracks.map((track: any) => (
                            <MenuItem
                                key={`audio-${track.id}`}
                                onClick={() => selectAudioTrack(track.id)}
                                isSelected={selectedAudioTrackId === track.id}
                            >
                                {renderTrackItem(track)}
                            </MenuItem>
                        ))}
                    </div>
                </div>
            )}

            {textTracks.length > 0 && (
                <div className="space-y-2">
                    <h4 className="px-3 text-xs font-bold text-white/80 uppercase tracking-wide">
                        {t('subtitles')}
                    </h4>
                    <div className="space-y-1">
                        <MenuItem onClick={disableTextTrack} isSelected={selectedTextTrackId === null}>
                            <span className="text-white/70">{t('off')}</span>
                        </MenuItem>
                        {textTracks.map((track: DisplayTrack) => (
                            <MenuItem
                                key={`text-${track.id}`}
                                onClick={() => selectTextTrack(track.id)}
                                isSelected={selectedTextTrackId === track.id}
                            >
                                {renderTrackItem(track)}
                            </MenuItem>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default TracksPanel;
