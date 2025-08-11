import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";
import { Icons } from "../common/Icon";
import { useFullscreenState } from "@/hooks/useFullscreen";

const FullscreenButton: React.FC = React.memo(() => {
    const { t } = useTranslation();
    const { isFullscreenActive, toggleFullscreen } = useFullscreenState();

    const label = isFullscreenActive ? t('exitFullscreen') : t('fullscreen');

    return (
        <Button onClick={toggleFullscreen} aria-label={label} title={label}>
            {isFullscreenActive ? <Icons.ExitFullscreenIcon className="w-6 h-6 fill-current text-primary" /> : <Icons.EnterFullscreenIcon className="w-6 h-6 fill-current text-primary" />}
        </Button>
    );
});

export default FullscreenButton;
