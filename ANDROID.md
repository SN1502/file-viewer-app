# Android APK

The Android app is the React web app wrapped with [Capacitor 8](https://capacitorjs.com)
and compiled by Gradle in GitHub Actions (`.github/workflows/build-apk.yml`).

## Getting the APK

Every push to `main` builds a signed release APK and publishes it on the
[Releases page](https://github.com/SN1502/file-viewer-app/releases/latest).

1. Open the latest release on your phone and tap `FileViewer-v1.0.N.apk`.
2. When Android asks, allow **Install unknown apps** for your browser or file manager.
3. Tap **Install**. Newer builds install over older ones and keep the app's data.

Requires Android 7.0 (API 24) or newer.

## What the pipeline does

1. `npm ci` and `npm run build` (Node 22) to build the web app into `dist/`
2. `npx cap sync android` to copy `dist/` into the Android project
3. `./gradlew assembleRelease` (JDK 21) to compile and sign the APK
4. `apksigner verify` to check the signature before publishing
5. Upload the APK as a workflow artifact and a GitHub Release

`versionCode` is the workflow run number, so each build is newer than the last.

## Signing

Release builds are signed with `android/app/fileviewer.keystore`, which is committed
so every build has the same signature (needed for updates to install over each other).
That's fine for installing on your own devices. Because the repo is public, anyone
could sign with it, so for Play Store or wider distribution create a private key and
provide it to Gradle through these environment variables (e.g. from GitHub secrets):

| Variable | Purpose |
|---|---|
| `ANDROID_KEYSTORE_PATH` | Path to the private keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

## Building locally

Needs Node 22+, JDK 21 and the Android SDK (API 36).

```bash
npm ci
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
# -> android/app/build/outputs/apk/release/app-release.apk
```
