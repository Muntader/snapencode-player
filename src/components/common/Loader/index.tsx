import React from "react";


interface SpinnerLoaderProps {
    className?: string;
}

const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({ className = "" }) => {
    return (
        <div className={`flex items-center justify-center`}>
            <div
                className={`spinner-border border-2 border-t-transparent dark:border-t-transparent border-zinc-500 dark:border-zinc-400 rounded-full animate-spin ${className}`}
            ></div>
        </div>
    );
};

const Loader = () => {
    return (
        <div className="bitbyte3-loader absolute left-0 top-0 bottom-0 right-0 z-1 transition-opacity duration-500 opacity-100 pointer-events-auto z-[1000]">
            <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                <SpinnerLoader className="w-10 h-10" />
            </div>
        </div>
    );
};

export default Loader;


