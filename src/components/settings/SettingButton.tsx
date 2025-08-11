
// SettingsButton.tsx
import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Icons } from '@/components/common/Icon';
import { SettingsMenuContent } from '@/components/settings/SettingsMenu';
import QualityPanel from "@/components/settings/panels/QualityPanel";
import TracksPanel from "@/components/settings/panels/TracksPanel";
import SpeedPanel from "@/components/settings/panels/SpeedPanel";
import { useModal } from "@/store/useModalStore";

interface SettingsButtonProps {
    className?: string;
    'aria-label'?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
                                                                  className,
                                                                  'aria-label': ariaLabel = "Settings"
                                                              }) => {
    const isOpen = useModal((state) => state.isOpen);
    const { openModal, closeModal } = useModal.getState();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = useCallback(() => {
        if (useModal.getState().isOpen) {
            closeModal();
        } else {
            openModal(
                <SettingsMenuContent>
                    <QualityPanel />
                    <TracksPanel />
                    <SpeedPanel />
                </SettingsMenuContent>,
                buttonRef
            );
        }
    }, [openModal, closeModal]);

    return (
        <Button
            ref={buttonRef}
            onClick={handleClick}
            aria-label={ariaLabel}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            className={`backdrop-blur-sm bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/50 transition-all duration-200 ${className || ''}`}
        >
            <Icons.SettingsIcon
                className="h-6 w-6 fill-current text-white drop-shadow-md transition-transform duration-200 hover:rotate-90"
            />
        </Button>
    );
};
