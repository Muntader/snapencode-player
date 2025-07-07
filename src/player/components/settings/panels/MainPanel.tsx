import React from "react";
import { Icons } from "../../common/Icon";

interface SettingsMenuPanelProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}

/**
 * A reusable UI component for a settings sub-panel, styled for a clean and modern look.
 * It's a simple layout block, allowing its parent to control positioning and animation.
 */
export const MainPanel: React.FC<SettingsMenuPanelProps> = ({ title, onBack, children }) => {
    return (
        // NEW: Changed to a clean white background.
        <div className="flex h-full flex-col bg-white">
            {/* Header section with back button and title */}
            <div className="flex flex-shrink-0 items-center border-b border-slate-200">
                <button
                    onClick={onBack}
                    // NEW: Updated colors for light theme and added focus styles for accessibility.
                    className="rounded-md p-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-label="Back to settings"
                >
                    <Icons.ChevronLeftIcon className="h-5 w-5" />
                </button>
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            </div>

            {/* The content area with refined padding */}
            <div className="flex-grow overflow-y-auto p-3">{children}</div>
        </div>
    );
};
