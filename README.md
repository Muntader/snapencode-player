# React SnapEncode Player

A modern, flexible, and feature-rich React video player built with TypeScript, Shaka Player, and TailwindCSS. It's designed to be easily customizable and extensible, providing a great out-of-the-box experience for playing a wide range of video content.

## Features

*   **Adaptive Streaming:** Powered by Shaka Player for MPEG-DASH and HLS playback.
*   **Customizable UI:** Use TailwindCSS to style the player to match your application's look and feel.
*   **TypeScript Support:** Fully typed for a better developer experience.
*   **Playlist Support:** Easily create and manage playlists.
*   **DRM Support:** Ready for protected content with Widevine, PlayReady, and FairPlay.
*   **Modern React:** Built with React hooks and functional components.

## Installation

You can install the player using npm or yarn:

```bash
npm install react-snapencode-player
```

```bash
yarn add react-snapencode-player
```

## Peer Dependencies

This library has `react` and `react-dom` as peer dependencies. You should have them already in your project.

```json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## Usage

Here's a simple example of how to use the player in your React application:

```jsx
import React from 'react';
import Player, { Configuration } from 'react-snapencode-player';

// 1. Import the CSS file
import 'react-snapencode-player/dist/react-snapencode-player.esm.min.css';

const App = () => {
  const config: Configuration = {
    source: {
      playlist: [
        {
          id: 'season-1',
          title: 'My Awesome Video',
          items: [
            {
              videoURL: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
              title: 'Angel One',
            },
          ],
        },
      ],
    },
  };

  return (
    <div style={{ width: '800px', margin: '0 auto' }}>
      <Player config={config} />
    </div>
  );
};

export default App;
```

### Important: Import the CSS

For the player to be styled correctly, you **must** import the CSS file from the package.

```javascript
import 'react-snapencode-player/dist/react-snapencode-player.esm.min.css';
```

## Configuration

The player is configured through the `config` prop, which takes an object of type `Configuration`. For a full list of available options, please refer to the type definitions in `src/types/index.ts`.

Here's a more advanced configuration example:

```jsx
const config: Configuration = {
  source: {
    playlist: [
      {
        id: 'season-1',
        title: 'My Awesome Video',
        items: [
          {
            videoURL: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
            title: 'Angel One',
            posterURL: 'https://your-poster-image.com/poster.jpg',
            duration: 120, // in seconds
          },
        ],
      },
    ],
  },
  behavior: {
    startMuted: true,
    lowLatency: false,
  },
  ui: {
    theme: {
      primaryColor: '#ff0000',
    },
    layout: {
      logoUrl: 'https://your-logo.com/logo.png',
      logoPosition: 'top-right',
    },
  },
};
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
