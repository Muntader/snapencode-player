// src/player/Player.tsx

import React, { useEffect } from "react";
import { PlayerProvider } from "./core/PlayerProvider";
import { Configuration } from "./types";
import { usePlayerConfigStore } from "./store/usePlayerConfigStore";
import ErrorBoundary from "@/core/ErrorBoundary";
import {PlayerCore} from "@/PlayerCore";


import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

interface PlayerProps {
    /** The single, unified configuration object for the player. */
    configuration: Configuration;
}

/**
 * The main public-facing Player component.
 * Its primary role is to initialize the configuration in the state management store.
 */
const Player: React.FC<PlayerProps> = ({ configuration }) => {
    const { loadConfiguration } = usePlayerConfigStore(state => state.actions);

    useEffect(() => {
        // Basic validation
        const initialVideo = configuration?.source?.playlist?.[0]?.items?.[0];
        if (!initialVideo) {
            console.error("Player Error: A valid configuration with a non-empty playlist must be provided.");
            return;
        }

        // Load the validated configuration into the global store.
        loadConfiguration(configuration, initialVideo);

    }, [configuration, loadConfiguration]);

    useEffect(() => {
        if (configuration.behavior?.language) {
            i18n.changeLanguage(configuration.behavior.language);
        }
    }, [configuration.behavior?.language]);

    return (
        <ErrorBoundary>
            <PlayerProvider>
                <I18nextProvider i18n={i18n}>
                    <PlayerCore />
                </I18nextProvider>
            </PlayerProvider>
        </ErrorBoundary>
    );
};

export default React.memo(Player);
