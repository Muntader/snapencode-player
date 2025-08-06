import React, { useState, useCallback } from "react";
import {usePlayerStateStore} from "@/store/usePlayerStateStore";
import {useShallow} from "zustand/react/shallow";
import {usePlayerControls} from "@/hooks/usePlayerControls";
import { Icons } from "../common/Icon";
import {Button} from "@/components/common/Button";
import {Slider} from "@/components/common/Slider";


const VolumeButton: React.FC = React.memo(() => {
    const { volume, isMuted } = usePlayerStateStore(
        useShallow(state => ({
            volume: state.volume,
            isMuted: state.isMuted
        }))
    );
    const { setVolume, toggleMute } = usePlayerControls();
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [optimisticVolume, setOptimisticVolume] = useState<number | null>(null);

    // UPDATED: Icons are styled for consistency with SettingsMenu (size and shadow).
    const getVolumeIcon = useCallback(() => {
        const displayVolume = optimisticVolume !== null ? optimisticVolume / 100 : volume;
        const muted = isMuted && optimisticVolume === null;
        const iconClassName = "w-6 h-6 fill-current text-primary drop-shadow-md";

        if (muted || displayVolume === 0) {
            return <Icons.VolumeMuteIcon className={iconClassName} />;
        } else if (displayVolume > 0 && displayVolume <= 0.5) {
            return <Icons.VolumeDownIcon className={iconClassName} />;
        } else {
            return <Icons.VolumeUpIcon className={iconClassName} />;
        }
    }, [volume, isMuted, optimisticVolume]);

    // No changes to handlers; they are correct.
    const handleVolumeChange = useCallback((newValue: number) => {
        setOptimisticVolume(newValue);
        setVolume(newValue / 100);
    }, [setVolume]);

    const handleDragEnd = useCallback((finalValue: number) => {
        setVolume(finalValue / 100);
        setOptimisticVolume(null);
    }, [setVolume]);

    const actualVolumePercent = isMuted ? 0 : volume * 100;

    return (
        <div
            className="volume-control-container relative flex items-center"
            onMouseEnter={() => setIsPanelVisible(true)}
            onMouseLeave={() => {
                if (optimisticVolume === null) {
                    setIsPanelVisible(false);
                }
            }}
        >
            <Button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="bottom-button z-20"
                aria-controls="volume-slider-panel"
                aria-expanded={isPanelVisible}
            >
                {getVolumeIcon()}
            </Button>

            {/* NEW: The slider panel is completely restyled to match the SettingsMenu */}
            <div
                id="volume-slider-panel"
                className={`
                    absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                    bg-white/90 backdrop-blur-md rounded-xl shadow-xl shadow-black/15
                    py-4 px-3 h-[140px] flex justify-center items-center
                    transition-all duration-200 ease-in-out z-10
                    ${isPanelVisible ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'}
                `}
                aria-hidden={!isPanelVisible}
            >
                {/*
                  NOTE: For the best look on a white background, you might want to adjust the
                  CustomSlider's internal track color (e.g., from 'bg-white/30' to 'bg-slate-200').
                  However, this component correctly passes all necessary props.
                */}
                <div className="h-[100px]">
                    <Slider
                        orientation="vertical"
                        value={actualVolumePercent}
                        previewValue={optimisticVolume}
                        onChange={handleVolumeChange}
                        onDragEnd={handleDragEnd}
                        // --- Pass the new optional props ---
                        progressBgColor={'bg-slate-500/90'}
                        progressColor="slider-primary" // A nice blue for the volume level
                        previewColor="bg-black/50" // A greyish preview looks good on a white background
                    />
                </div>
            </div>
        </div>
    );
});

VolumeButton.displayName = 'VolumeButton';
export default VolumeButton;
