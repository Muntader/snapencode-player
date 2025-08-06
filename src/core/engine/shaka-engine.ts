import { useEffect, useCallback, useRef } from 'react';
// @ts-ignore - Using the compiled core engine is correct for a custom UI.
import shaka from 'shaka-player/dist/shaka-player.compiled';
import { useShallow } from 'zustand/react/shallow';
import { useBitbyte3Player } from '@/core/PlayerProvider';
import { usePlayerConfigStore, useCurrentVideo } from '@/store/usePlayerConfigStore';
import { usePlayerStateStore, TextTrackInfo, TrackInfo } from '@/store/usePlayerStateStore';
import { Configuration, VideoItem, AdsConfig } from '@/types';

// ====================================================================================
// 1. Constants & Type Definitions
// ====================================================================================

const DVR_THRESHOLD_SECONDS = 30;
type ShakaTrack = shaka.extern.Track;

/**
 * A robust, universal base configuration for Shaka Player for both VOD and Live content.
 * This config prioritizes resilience and a smooth user experience.
 */
const UNIVERSAL_SHAKA_CONFIG: shaka.extern.PlayerConfiguration = {
    retryParameters: {
        maxAttempts: 4, baseDelay: 1000, backoffFactor: 2, fuzzFactor: 0.5, timeout: 20000,
    },
    drm: {
        retryParameters: { maxAttempts: 4, baseDelay: 1000, backoffFactor: 2, fuzzFactor: 0.5, timeout: 15000 }
    },
    abr: {
        defaultBandwidthEstimate: 5000000, bandwidthUpgradeTarget: 0.85, bandwidthDowngradeTarget: 0.95,
    },
    streaming: {
        bufferingGoal: 90,
        rebufferingGoal: 4,
        alwaysStreamText: true,
        // ⭐ FIX: Tell Shaka to be slightly more tolerant of small gaps between segments.
        // The default is 0.1. A small increase can help with poorly encoded content.
        gapDetectionThreshold: 0.15,
    },
    manifest: {
        // ⭐ FIX: For DASH content, ignore the manifest's minBufferTime if it's causing issues.
        // This lets our `bufferingGoal` take precedence.
        dash: {
            ignoreMinBufferTime: true,
        },
        // For HLS, be more resilient to subtitle loading errors.
        hls: {
            ignoreTextStreamFailures: true,
            defaultAudioCodec: 'mp4a.40.2',
            defaultVideoCodec: 'avc1.42E01E',
        }
    }
};


// ====================================================================================
// 2. Data Mapper Utility Functions
// ====================================================================================
/**
 * Parses a technical audio codec string into a user-friendly name.
 * @param codec - The codec string from a Shaka track (e.g., "mp4a.40.2", "opus").
 * @returns A friendly name like "AAC", "Opus", "Dolby", or null if not recognized.
 */
const parseAudioCodec = (codec?: string): string | null => {
    if (!codec) return null;
    const c = codec.toLowerCase();
    if (c.includes('opus')) return 'Opus';
    if (c.includes('mp4a') || c.includes('aac')) return 'AAC';
    if (c.includes('ac-3') || c.includes('eac3')) return 'Dolby';
    // Add other common codecs here if needed (e.g., DTS, FLAC)
    return null;
};

const mapVideoTracks = (tracks: ShakaTrack[]): any[] => {
    const trackMap = new Map<number, ShakaTrack>();
    tracks.filter(track => track.type === 'variant' && track.width && track.height)
        .forEach(track => {
            if (!trackMap.has(track.height!) || trackMap.get(track.height!)!.bandwidth < track.bandwidth!) {
                trackMap.set(track.height!, track);
            }
        });
    return Array.from(trackMap.values())
        .map(track => ({ id: track.id, type: 'video', active: track.active, width: track.width!, height: track.height!, bandwidth: track.bandwidth!, frameRate: track.frameRate, hdr: track.hdr, label: `${track.height}p` }))
        .sort((a, b) => b.height - a.height);
};

const mapTextTracks = (tracks: ShakaTrack[]): TextTrackInfo[] => {
    return tracks.map(track => ({ id: track.id, type: 'subtitle', active: track.active, language: track.language, label: track.label || track.language, kind: track.kind || 'subtitles' }));
};

const mapAudioTracks = (tracks: ShakaTrack[]): TrackInfo[] => {
    // Use a Map to store only unique tracks, keyed by "language:codec".
    const uniqueTracksMap = new Map<string, ShakaTrack>();

    tracks
        .filter(track => track.type === 'variant' && track.audioId)
        .forEach(track => {
            // THE FIX: Create a robust key using both language and audio codec.
            const uniqueKey = `${track.language}:${track.audioCodec}`;

            // This check prevents duplicates. If we haven't seen this specific
            // language/codec combination before, we add it to our map.
            if (!uniqueTracksMap.has(uniqueKey)) {
                uniqueTracksMap.set(uniqueKey, track);
            }
        });

    return Array.from(uniqueTracksMap.values()).map(track => {
        // Use an external utility (you already have this) to get the full language name.
        // Assuming LanguageParser exists, otherwise use track.label.
        // Example: 'en' -> 'English'
        const languageName = track.label || track.language; // Or LanguageParser(track.language, 'en')

        // Get the friendly codec name, e.g., "AAC" or "Opus".
        const codecName = parseAudioCodec(track.audioCodec);

        // Create the final, descriptive label for the UI.
        // It will be "English (Opus)" if a codec is found, otherwise just "English".
        const finalLabel = codecName ? `${languageName} (${codecName})` : languageName;

        return {
            id: track.audioId!,
            type: 'audio',
            active: track.active,
            language: track.language,
            label: finalLabel, // <-- The new, improved label
            bandwidth: track.bandwidth!
        };
    });
};


// ====================================================================================
// 3. The Core Player Engine Hook
// ====================================================================================

/**
 * A comprehensive hook that manages the Shaka Player's entire lifecycle.
 * It is responsible for configuration, loading, state synchronization, and cleanup.
 * It reacts to changes in the central Zustand stores.
 */
export const usePlayerEngine = () => {
    // --- Get STABLE values from React Context (for DOM interaction) ---
    const { player, playbackRef, containerRef, adContainerRef, cuesContainerRef } = useBitbyte3Player();

    // --- Get DYNAMIC state and actions from Zustand stores ---
    const { updateState, setAdCuePoints } = usePlayerStateStore(
        useShallow(state => state.actions)
    );
    const getState = usePlayerStateStore.getState;

    const configuration = usePlayerConfigStore(state => state.configuration);
    const currentVideo = useCurrentVideo();
    const { playNext } = usePlayerConfigStore(state => state.actions);

    const adManagerRef = useRef<shaka.ads.AdManager | null>(null);

    /**
     * EFFECT 1: Main Session Orchestrator
     * Runs whenever `currentVideo` changes to load new content.
     */
    useEffect(() => {
        if (!player || !configuration || !currentVideo || !playbackRef.current) {
            return;
        }

        const axinomRequestFilter = (type: shaka.net.NetworkingEngine.RequestType, request: shaka.extern.Request) => {
            if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
                const axinomToken = configuration.advanced?.drm?.axinomToken;
                if (axinomToken) {
                    request.headers['X-AxDRM-Message'] = axinomToken;
                }
            }
        };

        const initializeSession = async () => {
            await player.unload();
            updateState({ isReady: true, isContentLoaded: false, isBuffering: true, error: null, isPlaying: false, currentTime: 0, duration: 0, isAdPlaying: false });

            // 1. Assemble the final Shaka configuration object
            let finalShakaConfig: shaka.extern.PlayerConfiguration = { ...UNIVERSAL_SHAKA_CONFIG };

            if (currentVideo.isLive) {
                finalShakaConfig.streaming = {
                    ...finalShakaConfig.streaming,
                    ...(configuration.behavior?.lowLatency ? { lowLatencyMode: true } : { defaultPresentationDelay: 12 }),
                };
                if (configuration.behavior?.lowLatency) {
                    finalShakaConfig.manifest = { ...finalShakaConfig.manifest, availabilityWindowOverride: 15 };
                }
            }
            if (configuration.advanced?.drm) {
                finalShakaConfig.drm = { ...finalShakaConfig.drm, ...configuration.advanced.drm };
                player.getNetworkingEngine().registerRequestFilter(axinomRequestFilter);
            }
            if (configuration.advanced?.shakaConfig) {
                finalShakaConfig = shaka.util.PlayerConfiguration.merge(finalShakaConfig, configuration.advanced.shakaConfig);
            }

            console.log("ENGINE: Final configuration assembled.", finalShakaConfig);
            // 2. Apply the final configuration
            player.configure(finalShakaConfig);
            console.log("ENGINE: Final configuration applied.", finalShakaConfig);

            // 3. Setup Ads
            if (configuration.advanced?.ads && adContainerRef.current && playbackRef.current) {
                adManagerRef.current = player.getAdManager();
                setupAds(adManagerRef.current, configuration.advanced.ads, adContainerRef.current, playbackRef.current, updateState, setAdCuePoints);
            }

            // 4. Load Content
            try {
                await loadMainContent(player, configuration, currentVideo, playbackRef.current, cuesContainerRef.current!, updateState);
            } catch (error) {
                const e = error as shaka.util.Error;
                console.error("ENGINE: Critical error during loading.", e);
                updateState({ error: e, isBuffering: false });
            }
        };

        initializeSession();

        return () => {
            console.log("ENGINE: Tearing down content session.");
            adManagerRef.current = null; // Just clear our local ref.
            if (player.getMediaElement() && configuration.advanced?.drm) {
                player.getNetworkingEngine().unregisterRequestFilter(axinomRequestFilter);
            }
            if (player.getMediaElement()) {
                player.unload().catch((e: any) => console.warn("Unload failed during cleanup.", e));
            }
        };
    }, [player, configuration, currentVideo, updateState, setAdCuePoints, playbackRef, containerRef, adContainerRef, cuesContainerRef]);

    /**
     * EFFECT 2: Central State Synchronization Handler
     * Updates the Zustand store with the current track information from Shaka.
     */
    const syncPlayerStateWithStore = useCallback(() => {
        if (!player || !player.getMediaElement()) return;

        const stateChanges: Partial<ReturnType<typeof usePlayerStateStore.getState>> = {};
        if (player.isLive()) {
            const seekRange = player.seekRange();
            const dvrWindowSize = seekRange.end - seekRange.start;
            stateChanges.isLive = true;
            stateChanges.isSeekable = dvrWindowSize > DVR_THRESHOLD_SECONDS;
            stateChanges.duration = dvrWindowSize;
            stateChanges.seekRange = seekRange;
        }

        const variantTracks = player.getVariantTracks();
        const textTracks = player.getTextTracks();
        const activeVariant = variantTracks.find((t: { active: any; }) => t.active);
        const activeTextTrack = textTracks.find((t: { active: any; }) => t.active);

        stateChanges.videoTracks = mapVideoTracks(variantTracks);
        stateChanges.audioTracks = mapAudioTracks(variantTracks);
        stateChanges.textTracks = mapTextTracks(textTracks);
        stateChanges.selectedVideoTrackId = activeVariant?.id || null;
        stateChanges.selectedAudioTrackId = activeVariant?.audioId || null;
        stateChanges.selectedTextTrackId = activeTextTrack?.id || null;
        stateChanges.isTextTrackDisabled = !activeTextTrack;
        stateChanges.isAbrEnabled = player.getConfiguration().abr.enabled;

        updateState(stateChanges);
    }, [player, updateState]);

    /**
     * EFFECT 3: Universal Event Handler Attachment
     * Attaches and detaches all necessary Shaka and video element event listeners.
     */
    useEffect(() => {
        const video = playbackRef.current;
        const container = containerRef.current;
        if (!player || !video || !container) return;

        const activeListeners: { target: any; event: string; handler: (e: any) => void }[] = [];
        const listen = (target: any, event: string, handler: (e: any) => void) => {
            target.addEventListener(event, handler);
            activeListeners.push({ target, event, handler });
        };

        // Define all event handlers
        const onPlaying = () => !getState().isAdPlaying && updateState({ isPlaying: true, isBuffering: false });
        const onPause = () => !getState().isAdPlaying && updateState({ isPlaying: false });
        const onBuffering = (e: { buffering: boolean }) => !getState().isAdPlaying && updateState({ isBuffering: e.buffering });
        const onError = (e: { detail: shaka.util.Error }) => updateState({ error: e.detail, isPlaying: false, isBuffering: false });
        const onEnded = () => { updateState({ isPlaying: false }); playNext(); };
        const onVolumeChange = () => updateState({ volume: video.volume, isMuted: video.muted });
        const onFullscreenChange = () => updateState({ isFullscreenActive: !!document.fullscreenElement });
        const onTimeUpdate = () => {
            if (getState().isAdPlaying) return;
            const currentTime = video.currentTime;
            const skipInterval = currentVideo?.skipList?.find(i => currentTime >= i.startTime && currentTime <= i.endTime);
            updateState({ currentTime, activeSkipInterval: skipInterval || null });
        };
        const onLoadedMetadata = () => {
            if (!player.isLive()) {
                updateState({ isLive: false, duration: video.duration || 0, isSeekable: (video.duration || 0) > 0, seekRange: { start: 0, end: video.duration || 0 } });
            }
        };
        const onManifestOrTracksChanged = () => { console.log("ENGINE: Manifest/Tracks changed, syncing state..."); syncPlayerStateWithStore(); };

        // Attach listeners
        listen(player, 'error', onError);
        listen(player, 'buffering', onBuffering);
        listen(player, 'manifestparsed', onManifestOrTracksChanged);
        listen(player, 'trackschanged', onManifestOrTracksChanged);
        listen(player, 'adaptation', onManifestOrTracksChanged);
        listen(player, 'texttrackvisibility', onManifestOrTracksChanged);
        listen(player, 'textchanged', onManifestOrTracksChanged);
        listen(video, 'playing', onPlaying);
        listen(video, 'pause', onPause);
        listen(video, 'ended', onEnded);
        listen(video, 'timeupdate', onTimeUpdate);
        listen(video, 'volumechange', onVolumeChange);
        listen(video, 'loadedmetadata', onLoadedMetadata);
        listen(container, 'fullscreenchange', onFullscreenChange);

        return () => {
            activeListeners.forEach(({ target, event, handler }) => target.removeEventListener(event, handler));
        };
    }, [player, playbackRef, containerRef, playNext, syncPlayerStateWithStore, currentVideo, updateState]);
};


// ====================================================================================
// 4. Standalone Helper Functions
// ====================================================================================

function setupAds(adManager: shaka.ads.AdManager, adsConfig: AdsConfig, adContainer: HTMLElement, videoElement: HTMLMediaElement, updateState: Function, setAdCuePoints: Function) {
    adManager.initClientSide(adContainer, videoElement);
    adManager.addEventListener('ad-error', (e: any) => console.error('ENGINE: Ad Error', e));
    adManager.addEventListener('ad-started', () => updateState({ isAdPlaying: true }));
    adManager.addEventListener('ad-complete', () => updateState({ isAdPlaying: false }));
    adManager.addEventListener('ad-skipped', () => updateState({ isAdPlaying: false }));
    adManager.addEventListener(shaka.ads.AdManager.CUEPOINTS_CHANGED, (e: any) => setAdCuePoints(e.cuepoints));

    for (const ad of adsConfig.adTags) {
        // @ts-ignore
        const adsRequest = new google.ima.AdsRequest();
        adsRequest.adTagUrl = ad.adTagUrl;
        adManager.requestClientSideAds(adsRequest);
    }
}

async function loadMainContent(player: shaka.Player, config: Configuration, video: VideoItem, videoElement: HTMLMediaElement, cuesContainer: HTMLElement, updateState: Function) {
    // @ts-ignore
    videoElement.poster = video.posterURL || '';
    videoElement.muted = config.behavior?.startMuted || false;

    player.configure({
        textDisplayFactory: () => new shaka.text.UITextDisplayer(videoElement, cuesContainer),
        preferredAudioLanguage: config.behavior?.defaultAudioLanguage,
        preferredTextLanguage: config.behavior?.defaultTextLanguage,
    });

    await player.load(video.videoURL, video.lastWatchedPosition || 0);
    player.setTextTrackVisibility(true);
    updateState({ isContentLoaded: true });
    videoElement.play().catch(e => console.warn("Autoplay was prevented.", e));
}
