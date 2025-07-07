import React, { useState, Children, cloneElement, isValidElement, useMemo } from 'react';
import QualityPanel from "@/player/components/settings/panels/QualityPanel";
import TracksPanel from "@/player/components/settings/panels/TracksPanel";
import { MainPanel } from "@/player/components/settings/panels/MainPanel";
import { Icons } from "@/player/components/common/Icon";
import { cn } from '@/player/utils/cn';
import { useTracks } from "@/player/hooks/useTracks";

const settingsMap = new Map([
    [QualityPanel, { label: "Quality", icon: <Icons.HighQualityIcon /> }],
    [TracksPanel, { label: "Audio & Subtitles", icon: <Icons.TracksSelectionIcon /> }],
]);

interface SettingsMenuProps {
    // The component now receives the children it needs to render
    children: React.ReactNode;
}

export const SettingsMenuContent: React.FC<SettingsMenuProps> = ({ children }) => {
    const {
        audioTracks,
        textTracks,
    } = useTracks();
    const [activePanel, setActivePanel] = useState<string | null>(null);

    const validChildren = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);

    // Check if tracks panel should be visible
    const shouldShowTracksPanel = useMemo(() => {
        // Show if there are multiple audio tracks OR if there are any text tracks
        const hasMultipleAudioTracks = audioTracks && audioTracks.length > 1;
        const hasTextTracks = textTracks && textTracks.length > 0;

        return hasMultipleAudioTracks || hasTextTracks;
    }, [audioTracks, textTracks]);

    // Filter children based on track availability
    const availableChildren = useMemo(() => {
        return validChildren.filter(child => {
            // @ts-ignore
            const childType = child.type as React.ComponentType;

            // If it's TracksPanel, check if it should be shown
            if (childType === TracksPanel) {
                return shouldShowTracksPanel;
            }

            // Show all other panels
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

    // This component is now just the two-panel sliding interface.
    // It's wrapped in a div to ensure it fills the modal's container.
    return (
        <div className="h-full w-full">
            {/* Mobile-only header is part of the CONTENT, not the modal frame */}
            <div className="flex h-[53px] shrink-0 items-center px-4 md:hidden">
                {/* The title is contextual to the settings menu */}
                <h3 className="text-base font-semibold text-slate-800">Settings</h3>
            </div>

            <div className={cn(
                "flex transition-transform duration-300 ease-in-out",
                // On mobile, take up the remaining height. On desktop, let content flow.
                "h-[calc(100%-53px)] md:h-auto",
                activePanel ? "-translate-x-full" : "translate-x-0"
            )}>
                {/* PANEL 1: MAIN MENU */}
                <div className="w-full flex-shrink-0 overflow-y-auto">
                    <div className="p-1">
                        {availableChildren.map((child, index) => {
                            // @ts-ignore
                            const config = settingsMap.get(child.type as React.ComponentType);
                            if (!config) return null;

                            return (
                                <button
                                    key={index}
                                    onClick={() => setActivePanel(config.label)}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
                                >
                                    <div className="flex items-center gap-x-4">
                                        {cloneElement(config.icon, { className: "h-5 w-5" })}
                                        <span>{config.label}</span>
                                    </div>
                                    <Icons.ChevronRightIcon className="h-4 w-4 text-slate-400" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PANEL 2: SUB-MENU */}
                <div className="w-full flex-shrink-0">
                    {activePanelComponent && (
                        <MainPanel title={activePanel!} onBack={() => setActivePanel(null)}>
                            {activePanelComponent}
                        </MainPanel>
                    )}
                </div>
            </div>
        </div>
    );
};
