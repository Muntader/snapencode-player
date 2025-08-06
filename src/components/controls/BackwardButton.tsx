import React from "react";
import {usePlayerControls} from "@/hooks/usePlayerControls";
import {Button} from "@/components/common/Button";
import { Icons } from "../common/Icon";
import {cn} from "@/utils/cn";

interface BackwardButtonProps {
    /** Additional class names for the button element. */
    buttonClassName?: string;
    /** Additional class names for the icon element. Overrides the default size. */
    iconClassName?: string;
}

const BackwardButton: React.FC<BackwardButtonProps> = React.memo(({ buttonClassName, iconClassName }) => {
    // Using seekBackward for the default skip time defined in the core config
    const { seekBackward } = usePlayerControls();

    return (
        <Button
            onClick={() => seekBackward(10)}
            className={buttonClassName}
            aria-label="Seek Backward"
        >
            <Icons.BackwardIcon
                className={cn(
                    "w-6 h-6 fill-current text-primary", // Default size and style
                    iconClassName // Optional overrides (e.g., "w-12 h-12 text-white")
                )}
            />
        </Button>
    );
});

export default BackwardButton;
