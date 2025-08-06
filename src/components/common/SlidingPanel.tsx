import React from "react";
import { Button } from "./Button";
import {Icons} from "@/components/common/Icon";

interface SlidingPanelProps {
    title: string;
    onBack: () => void;
    // ⭐ Add a prop to control the back button's visibility
    showBack?: boolean;
    children: React.ReactNode;
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({ title, onBack, showBack = true, children }) => {
    return (
        <div className="flex h-full flex-col bg-white/95 text-slate-800">
            <div className="flex flex-shrink-0 items-center border-b border-slate-200">
                {/* ⭐ Conditionally render the button */}
                {showBack && (
                    <Button
                        onClick={onBack}
                        className="rounded-md p-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Back"
                    >
                        <Icons.ChevronLeftIcon className="h-5 w-5" />
                    </Button>
                )}
                <h3 className="text-base font-semibold px-4 py-2">{title}</h3>
            </div>
            <div className="flex-grow overflow-y-auto p-2">{children}</div>
        </div>
    );
};
