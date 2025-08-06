import React from "react";
import {usePlayerControls} from "@/hooks/usePlayerControls";
import {Button} from "@/components/common/Button";
import { Icons } from "../common/Icon";
import {cn} from "@/utils/cn";


interface ForwardButtonProps {
    /** Additional class names for the button element. */
    buttonClassName?: string;
    /** Additional class names for the icon element. Overrides the default size. */
    iconClassName?: string;
}

const ForwardButton: React.FC<ForwardButtonProps> = React.memo(({ buttonClassName, iconClassName }) => {
    // Using seekForward for the default skip time
    const { seekForward } = usePlayerControls();

    return (
        <Button
            onClick={() => seekForward(10)}
            className={buttonClassName}
            aria-label="Seek Forward"
        >
            <Icons.ForwardIcon
                className={cn(
                    "w-6 h-6 fill-current text-primary", // Default size and style
                    iconClassName // Optional overrides (e.g., "w-12 h-12 text-white")
                )}
            />
        </Button>
    );
});

export default ForwardButton;
