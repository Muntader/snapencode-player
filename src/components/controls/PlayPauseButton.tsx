import React from "react";
import {usePlayerStateStore} from "@/store/usePlayerStateStore";
import {usePlayerControls} from "@/hooks/usePlayerControls";
import {Button} from "@/components/common/Button";
import { Icons } from "../common/Icon";

const PlayPauseButton = React.memo(() => {
    // Get state from the state store.
    const isPlaying = usePlayerStateStore(state => state.isPlaying);
    // Get actions from the controls hook.
    const { togglePlay } = usePlayerControls();

    return (
        <Button onClick={togglePlay} aria-label={"Play/Pause"}>
            {isPlaying ? <Icons.PauseIcon className="w-6 h-6 fill-current text-primary" /> : <Icons.PlayIcon className="w-6 h-6 fill-current text-primary" />}
        </Button>
    );
});

export default PlayPauseButton;
