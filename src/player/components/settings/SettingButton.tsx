import React, { useRef, useCallback } from 'react';
import { Button } from '@/player/components/common/Button';
import { Icons } from '@/player/components/common/Icon';
import { SettingsMenuContent } from '@/player/components/settings/SettingsMenu';
import QualityPanel from "@/player/components/settings/panels/QualityPanel";
import TracksPanel from "@/player/components/settings/panels/TracksPanel";
import {useModal} from "@/player/store/useModalStore";

interface SettingsButtonProps {
    className?: string;
    'aria-label'?: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
                                                                  className,
                                                                  'aria-label': ariaLabel = "Settings"
                                                              }) => {
    // Get isOpen separately for the aria-expanded attribute
    const isOpen = useModal((state) => state.isOpen);
    // Get stable actions from the store. These functions never change.
    const { openModal, closeModal } = useModal.getState();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = useCallback(() => {
        // Get the LATEST state directly from the store inside the handler
        if (useModal.getState().isOpen) {
            closeModal();
        } else {
            openModal(
                <SettingsMenuContent>
                    <QualityPanel />
                    <TracksPanel />
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
            className={className}
        >
            <Icons.SettingsIcon
                className={`h-6 w-6 fill-current text-primary drop-shadow-md transition-transform duration-200`}
            />
        </Button>
    );
};
