# YouTube Picture-in-Picture Button

Chrome Manifest V3 extension built with Vite + TypeScript. It adds a native-looking **Picture-in-Picture** button directly to the YouTube player controls.

The visual approach intentionally reuses YouTube's own `ytp-button` class so the control inherits the player's hover, focus, sizing, and spacing behavior. The screenshot supplied for the task was used as the style reference: a compact white line icon, aligned with the native controls, without adding a separate toolbar or overlay.

## Features

- Native YouTube player control button.
- Uses the browser's `HTMLVideoElement.requestPictureInPicture()` API.
- Tracks PiP state via `enterpictureinpicture` / `leavepictureinpicture` events.
- Works with YouTube's SPA navigation through mutation observation and YouTube navigation events.
- TypeScript strict mode plus `typescript-eslint` strict type-checked rules.
- CI on pull requests and pushes to `master`.
- Every push to `master` creates a GitHub Release with a versioned ZIP artifact.

## Local development

Requirements: Node.js 22+ and npm 10+.

```bash
npm install
npm run lint
npm run build
```

The extension is produced in `dist/`.

### Install in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the project's `dist/` directory.
5. Open a YouTube video and expand the player controls.

## Release flow

The repository is designed around `master` as the release branch.

`CI` validates pull requests and `master` pushes with lint + build.

`Release` runs on every `master` push, builds the extension, creates `youtube-pip-button-v<package-version>-<run-number>.zip`, and publishes a GitHub Release with that archive attached.

The version in `package.json` / `public/manifest.json` is the semantic extension version. The GitHub tag additionally contains the workflow run number so each `master` push receives a unique release tag.

### Button placement

The PiP button is inserted into `.ytp-right-controls-left`, immediately after YouTube's settings button, before the separate right-controls group containing wide-screen and fullscreen controls.
