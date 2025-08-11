import React, { useState, Children, cloneElement, isValidElement, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import QualityPanel from "@/components/settings/panels/QualityPanel";
import TracksPanel from "@/components/settings/panels/TracksPanel";
import SpeedPanel from "@/components/settings/panels/SpeedPanel";
import { MainPanel } from "@/components/settings/panels/MainPanel";
import { Icons } from "@/components/common/Icon";
import { cn } from '@/utils/cn';
import { useTracks } from "@/hooks/useTracks";

const settingsMap = new Map([
    [QualityPanel, { label: "quality", icon: <Icons.HighQualityIcon /> }],
    [TracksPanel, { label: "audioAndSubtitles", icon: <Icons.TracksSelectionIcon /> }],
    [SpeedPanel, { label: "speed", icon: <Icons.SpeedIcon /> }],
]);

interface SettingsMenuProps {
    children: React.ReactNode;
}

export const SettingsMenuContent: React.FC<SettingsMenuProps> = ({ children }) => {
    const { t } = useTranslation();
    const { audioTracks, textTracks } = useTracks();
    const [activePanel, setActivePanel] = useState<string | null>(null);

    const validChildren = useMemo(() =>
            Children.toArray(children).filter(isValidElement),
        [children]
    );

    const shouldShowTracksPanel = useMemo(() => {
        const hasMultipleAudioTracks = audioTracks && audioTracks.length > 1;
        const hasTextTracks = textTracks && textTracks.length > 0;
        return hasMultipleAudioTracks || hasTextTracks;
    }, [audioTracks, textTracks]);

    const availableChildren = useMemo(() => {
        return validChildren.filter(child => {
            const childType = child.type as React.ComponentType;
            if (childType === TracksPanel) {
                return shouldShowTracksPanel;
            }
            return true;
        });
    }, [validChildren, shouldShowTracksPanel]);

    const activePanelComponent = useMemo(() => {
        if (!activePanel) return null;
        for (const [componentType, config] of settingsMap.entries()) {
            if (config.label === activePanel) {
                return availableChildren.find(child => child.type === componentType) || null;
            }
        }
        return null;
    }, [activePanel, availableChildren]);

    const handlePanelClick = useCallback((label: string) => {
        setActivePanel(label);
    }, []);

    const handleBackClick = useCallback(() => {
        setActivePanel(null);
    }, []);

    return (
        <div className="settings-menu relative min-w-80 max-w-md">
            {/* Backdrop blur with fallback */}
            <div className="absolute inset-0 backdrop-blur-md bg-zinc-900/95 rounded-xl border border-zinc-700/50 shadow-2xl">
                {/* Fallback for non-supporting browsers */}
                <div className="absolute inset-0 bg-zinc-900 rounded-xl opacity-95 backdrop-blur-none"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">

                {/* Menu Body */}
                <div className={cn(
                    "relative overflow-hidden transition-all duration-300 ease-out",
                    { 'h-80': !activePanel, 'h-96': activePanel }
                )}>
                    {/* Main Panel - slides left when child is active */}
                    <div className={cn(
                        "absolute inset-0 transition-transform duration-300 ease-out",
                        activePanel ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
                    )}>
                        <div className="p-2 space-y-1">
                            {availableChildren.map((child, index) => {
                                const config = settingsMap.get(child.type as React.ComponentType);
                                if (!config) return null;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handlePanelClick(config.label)}
                                        className="group flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-98"
                                    >
                                        <div className="flex items-center gap-3">
                                            {cloneElement(config.icon, {
                                                className: "h-5 w-5 text-white/70 fill-current group-hover:text-white transition-colors duration-200"
                                            })}
                                            <span className="font-medium">{t(config.label)}</span>
                                        </div>
                                        <Icons.ChevronRightIcon className="h-4 w-4 fill-current text-white/50 group-hover:text-white/70 transition-all duration-200 group-hover:translate-x-0.5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Child Panel - slides in from right */}
                    <div className={cn(
                        "absolute inset-0 transition-transform duration-300 ease-out",
                        activePanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                    )}>
                        {activePanelComponent && (
                            <MainPanel title={t(activePanel!)} onBack={handleBackClick}>
                                {activePanelComponent}
                            </MainPanel>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
