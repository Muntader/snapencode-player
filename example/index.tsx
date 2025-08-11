import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Player from '../src/Player';
import { Configuration } from '../src';

// ============================================================================
// STYLE HELPER FUNCTIONS
// ============================================================================
function parseColor(color: string): { hex: string; alpha: number } {
    if (!color) return { hex: '#000000', alpha: 1 };
    if (color.startsWith('#')) {
        const hexVal = color.substring(1);
        if (hexVal.length === 8) {
            const alphaHex = hexVal.substring(6, 8);
            const alpha = parseInt(alphaHex, 16) / 255;
            return { hex: `#${hexVal.substring(0, 6)}`, alpha: parseFloat(alpha.toFixed(2)) };
        }
        return { hex: color, alpha: 1 };
    }
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return { hex: '#000000', alpha: 1 };
    const [, r, g, b, a] = match;
    const toHex = (c: string) => ('0' + parseInt(c, 10).toString(16)).slice(-2);
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha: a !== undefined ? parseFloat(a) : 1 };
}

const hexToRgba = (hex: string, alpha: number): string => {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return `rgba(0,0,0,${alpha})`;
    let c = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    const r = parseInt(c.slice(0, 2).join(''), 16), g = parseInt(c.slice(2, 4).join(''), 16), b = parseInt(c.slice(4, 6).join(''), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const styles = {
    container: { display: 'flex', gap: '40px', margin: '20px auto', maxWidth: '1800px', fontFamily: 'Arial, sans-serif' },
    configPanel: { flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', maxHeight: '90vh', overflowY: 'auto' as 'auto' },
    playerContainer: { flex: 2, position: 'sticky', top: '20px' as 'sticky' },
    fieldset: { border: '1px solid #ddd', borderRadius: '4px', padding: '10px 15px', marginBottom: '20px' },
    legend: { padding: '0 5px', fontWeight: 'bold', color: '#333' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' },
    button: { width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    colorInputWrapper: { display: 'flex', alignItems: 'center', gap: '10px' },
};

// ============================================================================
// CONFIGURATION "RECIPES" & INITIAL STATE
// ============================================================================

const INITIAL_FORM_STATE = {
    source: { videoUrl: "https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd", title: "Sintel", posterUrl: "https://d2zihajmogu5jn.cloudfront.net/sintel/poster.png", vttThumbnailUrl: "http://localhost:9000/outputs/multi-tracks/thumbnails/thumbnails.vtt" },
    behavior: { isLive: false, lowLatency: false, startMuted: false, defaultAudioLanguage: 'en', defaultTextLanguage: 'en' },
    ui: {
        theme: {
            primaryColor: "#FFF", fontFamily: '"Verdana", sans-serif', playerBackgroundColor: '#000000',
            captions: {
                textColor: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                fontSize: '1.5rem',
                fontWeight: 700,
                fontStyle: 'normal' as const,
                edgeType: 'drop-shadow' as const
            },
        },
        layout: {
            width: '100%',
            height: '700px',
            logoUrl: 'https://bitbyte3.com/light-logo.png',
            logoPosition: 'top-right' as const
        },
        behavior: {hideControls: false, doubleClickToToggleFullscreen: true},
        components: {
            playPause: true,
            forward: true,
            backward: true,
            next: true,
            volume: true,
            playlist: true,
            qualitySelector: true,
            trackSelector: true,
            fullscreen: true,
            chromecast: true
        },
    },
    advanced: {
        ads: { adTagUrl: "" },
        drm: { servers: { 'com.widevine.alpha': '', 'com.microsoft.playready': '', 'com.apple.fps': '' }, fairplayCertificateUri: '' },
    },
};

const createFullConfiguration = (formState: any): Omit<Configuration, 'source'> => ({
    behavior: formState.behavior,
    ui: formState.ui,
    advanced: {
        ads: formState.advanced.ads.adTagUrl ? { adTags: [{ adTagUrl: formState.advanced.ads.adTagUrl }] } : undefined,
        drm: formState.advanced.drm,
    },
});

const createSingleVideoConfig = (formState: any): Configuration => ({
    ...createFullConfiguration(formState),
    source: { playlist: [{ id: 'main', title: 'Playlist', items: [{ videoURL: formState.source.videoUrl, title: formState.source.title, posterURL: formState.source.posterUrl, thumbnail: formState.source.vttThumbnailUrl, isLive: formState.behavior.isLive,
                markers: [
                    // These are "Chapters", which will create dividers.
                    { startTime: 0, endTime: 50,    label: 'Introduction',                  type: 'chapter' },
                    { startTime: 60, endTime: 120,  label: 'Chapter 2: The Early Days',     type: 'chapter' },
                    { startTime: 130, endTime: 170,  label: 'Chapter 3: The Discovery',      type: 'chapter' },
                    { startTime: 180, endTime: 190, label: 'Chapter 4: The Impact',         type: 'chapter' },
                ]
            }] }] },
});

const createSinglePlaylistConfig = (formState: any): Configuration => {
    const config = createSingleVideoConfig(formState);
    config.source.playlist[0].items.push(
        { videoURL: "https://d2zihajmogu5jn.cloudfront.net/big-buck-bunny/master.m3u8", title: "Big Buck Bunny", posterURL: "https://d2zihajmogu5jn.cloudfront.net/big-buck-bunny/poster.png" },
        { videoURL: "https://d2zihajmogu5jn.cloudfront.net/elephants-dream/master.m3u8", title: "Elephants Dream", posterURL: "https://d2zihajmogu5jn.cloudfront.net/elephants-dream/poster.png" }
    );
    return config;
};

const createMultiPlaylistConfig = (formState: any): Configuration => {
    const config = createFullConfiguration(formState);
    // @ts-ignore
    config.source = {
        playlist: [
            { id: 's1', title: 'Season 1', items: [
                    { videoURL: formState.source.videoUrl, title: formState.source.title, posterURL: formState.source.posterUrl },
                    { videoURL: 'https://d2zihajmogu5jn.cloudfront.net/big-buck-bunny/master.m3u8', title: 'Big Buck Bunny', posterURL: 'https://d2zihajmogu5jn.cloudfront.net/big-buck-bunny/poster.png' },
                ]},
            { id: 's2', title: 'Season 2', items: [
                    { videoURL: 'https://d2zihajmogu5jn.cloudfront.net/elephants-dream/master.m3u8', title: 'Elephants Dream', posterURL: 'https://d2zihajmogu5jn.cloudfront.net/elephants-dream/poster.png' },
                    { videoURL: 'https://d2zihajmogu5jn.cloudfront.net/caminandes/master.m3u8', title: 'Caminandes', posterURL: 'https://d2zihajmogu5jn.cloudfront.net/caminandes/poster.png' },
                ]},
        ],
    };
    return config;
};


// ============================================================================
// APP COMPONENT WITH ROBUST FORM HANDLING
// ============================================================================
const App = () => {
    const [formState, setFormState] = useState(INITIAL_FORM_STATE);
    const [playerConfig, setPlayerConfig] = useState<Configuration | null>(null);
    const [testMode, setTestMode] = useState<'singleVideo' | 'singlePlaylist' | 'multiPlaylist'>('singleVideo');
    const [playerKey, setPlayerKey] = useState(1);

    /**
     * A single, robust handler for all form inputs, including deeply nested ones.
     * It uses a `data-path` attribute to navigate the state object.
     * For object keys that contain dots (like DRM servers), use `data-key` as well.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value, type, dataset } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const finalValue = type === 'checkbox' ? checked : value;

        const path = dataset.path?.split('.');
        const key = dataset.key; // For keys with dots, e.g., 'com.widevine.alpha'

        if (!path) return;

        setFormState(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep clone for safe mutation
            let currentLevel: any = newState;

            // Navigate to the parent of the target property
            for (let i = 0; i < path.length; i++) {
                currentLevel = currentLevel[path[i]];
            }

            // Set the value on the final key
            const finalKey = key || path[path.length - 1];
            if (key) { // If a data-key is provided, path points to the parent object
                currentLevel[finalKey] = finalValue;
            } else { // Otherwise, path pointed to the property itself, so we need its parent
                let parentLevel = newState;
                for (let i = 0; i < path.length -1; i++) {
                    parentLevel = parentLevel[path[i]];
                }
                parentLevel[finalKey] = finalValue;
            }

            return newState;
        });
    };

    useEffect(() => { setPlayerConfig(createSingleVideoConfig(formState)); }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let configToLoad: Configuration;
        switch (testMode) {
            case 'singlePlaylist': configToLoad = createSinglePlaylistConfig(formState); break;
            case 'multiPlaylist': configToLoad = createMultiPlaylistConfig(formState); break;
            default: configToLoad = createSingleVideoConfig(formState); break;
        }
        setPlayerConfig(configToLoad);
        setPlayerKey(prev => prev + 1);
        console.log(`Loading player in "${testMode}" mode:`, configToLoad);
    };

    return (
        <div style={styles.container}>
            <div style={styles.configPanel}>
                <h2 style={{ marginTop: 0 }}>Player Test Harness</h2>
                <form onSubmit={handleSubmit}>
                    <fieldset style={styles.fieldset}><legend style={styles.legend}>Test Scenario</legend>
                        <select style={styles.input} value={testMode} onChange={e => setTestMode(e.target.value as any)}>
                            <option value="singleVideo">Single Video</option>
                            <option value="singlePlaylist">Single Playlist</option>
                            <option value="multiPlaylist">Multi-Playlist (Seasons)</option>
                        </select>
                    </fieldset>

                    <fieldset style={styles.fieldset}><legend style={styles.legend}>Source</legend>
                        <div style={styles.inputGroup}><label style={styles.label}>Video URL</label><input style={styles.input} type="text" data-path="source.videoUrl" value={formState.source.videoUrl} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Title</label><input style={styles.input} type="text" data-path="source.title" value={formState.source.title} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Poster URL</label><input style={styles.input} type="text" data-path="source.posterUrl" value={formState.source.posterUrl} onChange={handleInputChange} /></div>
                    </fieldset>

                    <fieldset style={styles.fieldset}><legend style={styles.legend}>Playback Behavior</legend>
                        <div style={styles.inputGroup}><label style={{...styles.label, display: 'flex' }}><input type="checkbox" data-path="behavior.isLive" checked={formState.behavior.isLive} onChange={handleInputChange} />  Is Live</label></div>
                        <div style={styles.inputGroup}><label style={{...styles.label, display: 'flex' }}><input type="checkbox" data-path="behavior.startMuted" checked={formState.behavior.startMuted} onChange={handleInputChange} />  Start Muted</label></div>
                        <div style={styles.inputGroup}><label style={{...styles.label, display: 'flex' }}><input type="checkbox" data-path="behavior.lowLatency" checked={formState.behavior.lowLatency} onChange={handleInputChange} />  Low Latency Mode</label></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Default Audio Language</label><input style={styles.input} type="text" data-path="behavior.defaultAudioLanguage" value={formState.behavior.defaultAudioLanguage} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Default Text Language</label><input style={styles.input} type="text" data-path="behavior.defaultTextLanguage" value={formState.behavior.defaultTextLanguage} onChange={handleInputChange} /></div>
                    </fieldset>

                    <fieldset style={styles.fieldset}><legend style={styles.legend}>UI Layout & Theme</legend>
                        <div style={styles.inputGroup}><label style={styles.label}>Logo URL</label><input style={styles.input} type="text" data-path="ui.layout.logoUrl" value={formState.ui.layout.logoUrl} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Logo Position</label><select style={styles.input} data-path="ui.layout.logoPosition" value={formState.ui.layout.logoPosition} onChange={handleInputChange}><option>top-right</option><option>top-left</option><option>bottom-right</option><option>bottom-left</option></select></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Primary Color</label><div style={styles.colorInputWrapper}><input style={{...styles.input, flex: 1}} type="text" data-path="ui.theme.primaryColor" value={formState.ui.theme.primaryColor} onChange={handleInputChange} /><input type="color" value={formState.ui.theme.primaryColor} data-path="ui.theme.primaryColor" onChange={handleInputChange} style={{padding:0, border:'none', background:'none', width:'40px', height:'35px'}} /></div></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Player Background</label><div style={styles.colorInputWrapper}><input style={{...styles.input, flex: 1}} type="text" data-path="ui.theme.playerBackgroundColor" value={formState.ui.theme.playerBackgroundColor} onChange={handleInputChange} /><input type="color" value={formState.ui.theme.playerBackgroundColor} data-path="ui.theme.playerBackgroundColor" onChange={handleInputChange} style={{padding:0, border:'none', background:'none', width:'40px', height:'35px'}} /></div></div>
                        <div style={styles.inputGroup}><label style={{...styles.label, display: 'flex' }}><input type="checkbox" data-path="ui.behavior.hideControls" checked={formState.ui.behavior.hideControls} onChange={handleInputChange} />  Hide All Controls</label></div>
                    </fieldset>

                    <fieldset style={styles.fieldset}><legend style={styles.legend}>Caption Styling</legend>
                        <div style={styles.inputGroup}><label style={styles.label}>Background Color (RGBA)</label><div style={styles.colorInputWrapper}><input style={{...styles.input, flex: 1}} type="text" data-path="ui.theme.captions.backgroundColor" value={formState.ui.theme.captions.backgroundColor} onChange={handleInputChange}/></div></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Text Color (Hex)</label><div style={styles.colorInputWrapper}><input style={{...styles.input, flex: 1}} type="text" data-path="ui.theme.captions.textColor" value={formState.ui.theme.captions.textColor} onChange={handleInputChange}/><input type="color" value={parseColor(formState.ui.theme.captions.textColor).hex} data-path="ui.theme.captions.textColor" onChange={handleInputChange} style={{padding:0, border:'none', background:'none', width:'40px', height:'35px'}}/></div></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Font Size</label><select style={styles.input} data-path="ui.theme.captions.fontSize" value={formState.ui.theme.captions.fontSize} onChange={handleInputChange}><option>1rem</option><option>1.25rem</option><option>1.5rem</option><option>2.25rem</option></select></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Edge Style</label><select style={styles.input} data-path="ui.theme.captions.edgeType" value={formState.ui.theme.captions.edgeType} onChange={handleInputChange}><option>none</option><option>drop-shadow</option><option>raised</option><option>uniform</option></select></div>
                    </fieldset>

                    <fieldset style={styles.fieldset}><legend style={styles.legend}>UI Components</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {Object.keys(formState.ui.components).map(key => (<label key={key} style={{...styles.label, display: 'flex' }}><input type="checkbox" data-path={`ui.components`} data-key={key} checked={formState.ui.components[key as keyof typeof formState.ui.components]} onChange={handleInputChange} />  {key.charAt(0).toUpperCase() + key.slice(1)}</label>))}
                        </div>
                    </fieldset>

                    <fieldset style={styles.fieldset}><legend style={styles.legend}>Advanced: Ads & DRM</legend>
                        <div style={styles.inputGroup}><label style={styles.label}>VAST Ad Tag URL</label><input style={styles.input} type="text" data-path="advanced.ads.adTagUrl" value={formState.advanced.ads.adTagUrl} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>Widevine URL</label><input style={styles.input} type="text" data-path="advanced.drm.servers" data-key="com.widevine.alpha" value={formState.advanced.drm.servers['com.widevine.alpha']} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>PlayReady URL</label><input style={styles.input} type="text" data-path="advanced.drm.servers" data-key="com.microsoft.playready" value={formState.advanced.drm.servers['com.microsoft.playready']} onChange={handleInputChange} /></div>
                        <div style={styles.inputGroup}><label style={styles.label}>FairPlay Cert URL</label><input style={styles.input} type="text" data-path="advanced.drm.fairplayCertificateUri" value={formState.advanced.drm.fairplayCertificateUri} onChange={handleInputChange} /></div>
                    </fieldset>

                    <button type="submit" style={styles.button}>Load / Reload Player</button>
                </form>
            </div>
            <div style={styles.playerContainer}>
                {playerConfig ? (<Player key={playerKey} configuration={playerConfig} />) : (<div>Loading...</div>)}
                <div style={{ marginTop: '20px', background: '#eee', padding: '15px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '300px', overflowY: 'auto' }}>
                    <strong>Current `Configuration` Prop:</strong><br/>{JSON.stringify(playerConfig, null, 2)}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Entry Point
// ============================================================================
const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<React.StrictMode><App /></React.StrictMode>);
}
