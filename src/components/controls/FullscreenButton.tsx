import React from "react";
import {Button} from "@/components/common/Button";
import { Icons } from "../common/Icon";
import {useFullscreenState} from "@/hooks/useFullscreen";
const FullscreenButton: React.FC = React.memo(() => {
    // The new hook provides both the state and the action.
    const { isFullscreenActive, toggleFullscreen } = useFullscreenState();

    // Note: The ability to fullscreen is implicitly handled by the browser.
    // The button will simply not work if the feature is disabled (e.g., in an iframe without allowfullscreen).
    // You could add a check `if (!document.fullscreenEnabled)` but it's often not necessary.

    return (
        <Button onClick={toggleFullscreen} aria-label={"Fullscreen"}>
            {isFullscreenActive ? <Icons.ExitFullscreenIcon className="w-6 h-6 fill-current text-primary" /> : <Icons.EnterFullscreenIcon className="w-6 h-6 fill-current text-primary" />}
        </Button>
    );
});

export default FullscreenButton;
