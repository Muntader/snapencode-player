import React from "react";
import { useTranslation } from "react-i18next";
import { usePlayerStateStore } from "@/store/usePlayerStateStore";
import { usePlayerControls } from "@/hooks/usePlayerControls";
import { Button } from "@/components/common/Button";
import { Icons } from "../common/Icon";

const PlayPauseButton = React.memo(() => {
    const { t } = useTranslation();
    const isPlaying = usePlayerStateStore(state => state.isPlaying);
    const { togglePlay } = usePlayerControls();

    const label = isPlaying ? t('pause') : t('play');

    return (
        <Button onClick={togglePlay} aria-label={label} title={label}>
            {isPlaying ? <Icons.PauseIcon className="w-6 h-6 fill-current text-primary" /> : <Icons.PlayIcon className="w-6 h-6 fill-current text-primary" />}
        </Button>
    );
});

export default PlayPauseButton;
