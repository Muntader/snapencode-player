import React from "react";
import {useCurrentVideo, usePlayerConfigStore} from "@/store/usePlayerConfigStore";

const Header: React.FC = React.memo(() => {
    // This component was already correct, as it reads from the config store.
    const currentVideo  = useCurrentVideo()
    return (
        <div className="title">
            <h3 className="select-none text-white font-semibold">{currentVideo?.title}</h3>
            <p className="select-none text-white">{currentVideo?.description}</p>
        </div>
    );
});

export default Header;
