import React from 'react';
import { usePlayerConfigStore } from '@/player/store/usePlayerConfigStore';
import { Button } from '@/player/components/common/Button';
import {Icons} from "@/player/components/common/Icon";

const NextButton = () => {
    // Get the playNext action directly from the store.
    // This is performant as the 'actions' object is stable.
    const { playNext } = usePlayerConfigStore(state => state.actions);

    return (
        <Button
            onClick={playNext}
            aria-label="Next Video"
            className="text-white p-2 rounded-full hover:bg-white/20"
        >
            <Icons.NextItemIcon className="fill-current text-primary w-6 h-6" />
        </Button>
    );
};

export default NextButton;
