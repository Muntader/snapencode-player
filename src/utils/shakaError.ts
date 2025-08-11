// @ts-ignore
import shaka from 'shaka-player';

interface FormattedError {
    title: string;
    message: string;
    code: number;
}

/**
 * Maps a Shaka Player error object to a user-friendly title and message.
 * @param error The error object from Shaka Player.
 */
export function formatShakaError(error: shaka.util.Error): FormattedError {
    const { code } = error;
    let title = 'Playback Error';
    let message = `An unexpected issue occurred. Please try again. (Code: ${code})`;

    // See Shaka Player error codes documentation for a full list
    // https://shaka-player-demo.appspot.com/docs/api/shaka.util.Error.html
    switch (code) {
        // --- Network Errors ---
        case shaka.util.Error.Code.BAD_HTTP_STATUS:
        case shaka.util.Error.Code.HTTP_ERROR:
            title = 'Network Problem';
            message = 'There was a problem connecting to the video server. Please check your internet connection.';
            break;

        // --- Media/Content Errors ---
        case shaka.util.Error.Code.MANIFEST_PARSER_ERROR:
        case shaka.util.Error.Code.MANIFEST_INVALID_CODE:
        case shaka.util.Error.Code.UNSUPPORTED_SCHEME:
            title = 'Invalid Video File';
            message = 'This video file is either corrupted or in a format that can’t be played on your device.';
            break;

        case shaka.util.Error.Code.MEDIA_SOURCE_FAILURE:
        case shaka.util.Error.Code.VIDEO_ERROR:
            title = 'Media Playback Error';
            message = 'Your browser encountered a problem while trying to play this video.';
            break;

        // --- DRM/Content Protection Errors ---
        case shaka.util.Error.Code.REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE:
        case shaka.util.Error.Code.DRM_SCHEME_NOT_SUPPORTED:
        case shaka.util.Error.Code.LICENSE_REQUEST_FAILED:
            title = 'Content Protection Error';
            message = 'This video is protected and we were unable to load the license required to play it.';
            break;

        // --- Other Common Errors ---
        case shaka.util.Error.Code.LOAD_INTERRUPTED:
            title = 'Loading Canceled';
            message = 'The video loading was canceled. Please try again.';
            break;
    }

    return { title, message, code };
}
