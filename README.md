# React SnapEncode Player

A React video player library built on Shaka Player with support for adaptive streaming (DASH/HLS), DRM, and playlists. Styled with TailwindCSS and fully typed with TypeScript.

## Why This Player?

- **Adaptive Streaming** - Supports MPEG-DASH and HLS with automatic quality switching
- **DRM Ready** - Works with Widevine, PlayReady, and FairPlay for protected content
- **Playlist Support** - Built-in playlist management with seasons and episodes
- **Customizable** - Easy theming and UI customization with TailwindCSS
- **TypeScript** - Full type definitions included
- **Lightweight** - Tree-shakeable and optimized bundle size

## Installation

```bash
npm install react-snapencode-player
```

or

```bash
yarn add react-snapencode-player
```

**Note:** React 18+ or 19+ is required as a peer dependency.

## Quick Start

```jsx
import Player from 'react-snapencode-player';
import 'react-snapencode-player/dist/react-snapencode-player.esm.min.css';

function App() {
  const config = {
    source: {
      playlist: [
        {
          id: 'video-1',
          title: 'My Video',
          items: [
            {
              videoURL: 'https://example.com/video.mpd',
              title: 'Episode 1',
            },
          ],
        },
      ],
    },
  };

  return <Player config={config} />;
}
```

**Important:** You must import the CSS file for the player to display correctly.

## Usage Examples

### Basic Single Video

```jsx
import Player from 'react-snapencode-player';
import 'react-snapencode-player/dist/react-snapencode-player.esm.min.css';

function VideoPlayer() {
  const config = {
    source: {
      playlist: [
        {
          id: 'single-video',
          title: 'Tutorial',
          items: [
            {
              videoURL: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
              title: 'Getting Started',
              posterURL: 'https://example.com/poster.jpg',
            },
          ],
        },
      ],
    },
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Player config={config} />
    </div>
  );
}
```

### Playlist with Multiple Episodes

```jsx
const config = {
  source: {
    playlist: [
      {
        id: 'season-1',
        title: 'Season 1',
        items: [
          {
            videoURL: 'https://example.com/s1e1.mpd',
            title: 'Episode 1: Pilot',
            posterURL: 'https://example.com/s1e1-poster.jpg',
            duration: 2400, // 40 minutes in seconds
          },
          {
            videoURL: 'https://example.com/s1e2.mpd',
            title: 'Episode 2: The Beginning',
            posterURL: 'https://example.com/s1e2-poster.jpg',
            duration: 2700,
          },
        ],
      },
      {
        id: 'season-2',
        title: 'Season 2',
        items: [
          {
            videoURL: 'https://example.com/s2e1.mpd',
            title: 'Episode 1: Return',
            posterURL: 'https://example.com/s2e1-poster.jpg',
            duration: 2550,
          },
        ],
      },
    ],
  },
};
```

### Custom Theme and Branding

```jsx
const config = {
  source: {
    playlist: [
      // ... your playlist
    ],
  },
  ui: {
    theme: {
      primaryColor: '#3b82f6', // Blue accent color
    },
    layout: {
      logoUrl: 'https://example.com/logo.png',
      logoPosition: 'top-right', // or 'top-left'
    },
  },
};
```

### Autoplay and Muted Start

```jsx
const config = {
  source: {
    playlist: [
      // ... your playlist
    ],
  },
  behavior: {
    startMuted: true,  // Start with audio muted
    lowLatency: false, // Enable for live streams
  },
};
```

### HLS Streaming

```jsx
const config = {
  source: {
    playlist: [
      {
        id: 'hls-video',
        title: 'Live Stream',
        items: [
          {
            videoURL: 'https://example.com/stream.m3u8',
            title: 'Live Event',
          },
        ],
      },
    ],
  },
};
```

### DRM Protected Content

```jsx
const config = {
  source: {
    playlist: [
      {
        id: 'protected-video',
        title: 'Premium Content',
        items: [
          {
            videoURL: 'https://example.com/protected.mpd',
            title: 'DRM Protected Video',
            drm: {
              servers: {
                'com.widevine.alpha': 'https://example.com/widevine-license',
                'com.microsoft.playready': 'https://example.com/playready-license',
              },
            },
          },
        ],
      },
    ],
  },
};
```

## Configuration Options

### Source Configuration

| Property | Type | Description |
|----------|------|-------------|
| `playlist` | `Array` | Array of playlist items (seasons/collections) |
| `playlist[].id` | `string` | Unique identifier for the playlist |
| `playlist[].title` | `string` | Display name for the playlist |
| `playlist[].items` | `Array` | Array of video items |
| `playlist[].items[].videoURL` | `string` | URL to the video manifest (DASH/HLS) |
| `playlist[].items[].title` | `string` | Video title |
| `playlist[].items[].posterURL` | `string` | Optional poster image URL |
| `playlist[].items[].duration` | `number` | Optional duration in seconds |

### UI Configuration

| Property | Type | Description |
|----------|------|-------------|
| `ui.theme.primaryColor` | `string` | Hex color for UI accents |
| `ui.layout.logoUrl` | `string` | URL to your logo image |
| `ui.layout.logoPosition` | `'top-left' \| 'top-right'` | Logo position |

### Behavior Configuration

| Property | Type | Description |
|----------|------|-------------|
| `behavior.startMuted` | `boolean` | Start playback muted |
| `behavior.lowLatency` | `boolean` | Enable low-latency mode for live streams |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Build ESM module
npm run build:esm

# Generate TypeScript definitions
npm run build:types
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

Check the package for license information.

## Support

For issues and questions, please open an issue on the project repository.
