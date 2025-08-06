export interface VttCue {
    startTime: number;
    endTime: number;
    spriteUrl: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

const parseTime = (timeString: string): number => {
    const parts = timeString.split(':');
    const secondsAndMillis = parts.pop()!.split('.');
    const hours = parts.length > 1 ? parseInt(parts.shift()!, 10) : 0;
    const minutes = parseInt(parts.shift() || '0', 10);
    const seconds = parseInt(secondsAndMillis[0], 10);
    return hours * 3600 + minutes * 60 + seconds;
};

// @ts-ignore
const ParseVTTFile = async (vttUrl: string): Promise<VttCue[]> => {
    try {
        const response = await fetch(vttUrl);
        if (!response.ok) {
           return [];
        }
        const vttText = await response.text();
        const lines = vttText.split(/\r?\n/);
        const cues: VttCue[] = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                const timeParts = lines[i].split(' --> ');
                const startTime = parseTime(timeParts[0]);
                const endTime = parseTime(timeParts[1].split(' ')[0]); // Handle potential extra attributes

                // The URL with coordinates is on the next line
                const payloadLine = lines[++i];
                if (payloadLine) {
                    const [spriteRelativeUrl, coords] = payloadLine.split('#xywh=');
                    if (spriteRelativeUrl && coords) {
                        const [x, y, w, h] = coords.split(',').map(Number);
                        const spriteUrl = new URL(spriteRelativeUrl, vttUrl).href; // Resolve relative URL
                        cues.push({ startTime, endTime, spriteUrl, x, y, w, h });
                    }
                }
            }
        }
        return cues;
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Failed to parse VTT file:", message);
    }
};

export default ParseVTTFile;
