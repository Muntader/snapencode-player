import React from "react";
import {useCurrentVideo, usePlayerConfigStore} from "@/store/usePlayerConfigStore";

const Header: React.FC = React.memo(() => {
    // This component was already correct, as it reads from the config store.
    const currentVideo  = useCurrentVideo()
    const configuration = usePlayerConfigStore(state => state.configuration);
    const uiConfig = configuration?.ui;

    return (
        <div className="flex space-x-4 items-center p-4">
            {uiConfig?.layout?.logoUrl && (
                <div
                    className="relative z-10 w-20 pointer-events-none"
                    style={{ filter: "drop-shadow(0 2px 3px rgb(0 0 0 / 0.5))" }}
                >
                    <img
                        src={uiConfig.layout.logoUrl}
                        alt="Player Logo"
                        className="w-full h-auto"
                    />
                </div>
            )}
            <div className="title">
                {/* --> Title Styling: A much stronger shadow is required without a background */}
                <h3 className="w-full break-words select-none text-white text-xl font-bold [text-shadow:0_2px_4px_rgb(0_0_0_/_60%)]">
                    {currentVideo?.title}
                </h3>
                {/* --> Description Styling: Also needs a shadow */}
                <p className="select-none text-white/90 text-sm line-clamp-2 [text-shadow:0_1px_3px_rgb(0_0_0_/_50%)]">
                    {currentVideo?.description}
                </p>
            </div>
        </div>
    );
});

export default Header;
