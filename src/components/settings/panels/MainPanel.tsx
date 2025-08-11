import React from "react";
import { Icons } from "../../common/Icon";

interface MainPanelProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}

export const MainPanel: React.FC<MainPanelProps> = ({ title, onBack, children }) => {
    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="relative flex h-14 flex-shrink-0 items-center justify-center border-b border-zinc-700/50 px-2">
                <button
                    onClick={onBack}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
                    aria-label="Back to settings"
                >
                    <Icons.ChevronLeftIcon className="h-5 w-5 fill-current text-white" />
                </button>
                <h3 className="text-base font-semibold text-white tracking-tight truncate px-12">
                    {title}
                </h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
                {children}
            </div>
        </div>
    );
};
