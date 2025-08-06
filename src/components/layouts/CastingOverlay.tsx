import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {usePlayerStateStore} from "@/store/usePlayerStateStore";
import { Icons } from '../common/Icon';

export const CastingOverlay: React.FC = () => {
    // Get only the state needed for this component
    const { castState, castDeviceName } = usePlayerStateStore(
        useShallow(state => ({
            castState: state.castState,
            castDeviceName: state.castDeviceName,
        }))
    );

    // Only render the overlay if we are actively connected.
    if (castState !== 'CONNECTED') {
        return null;
    }

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white select-none">
            <Icons.CastConnectedIcon className="w-16 h-16 mb-4 text-white" />
            <h2 className="text-2xl font-bold">Casting to</h2>
            <p className="text-lg text-gray-300">{castDeviceName || 'your device'}</p>
        </div>
    );
};
