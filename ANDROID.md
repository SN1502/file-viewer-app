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

## Using it instead of Excel / Adobe Reader

File Viewer registers itself as a handler for PDF, Excel (`xlsx`, `xlsm`, `xlsb`, `xls`,
`ods`) and CSV/TSV files. Tap one of those files in your file manager, WhatsApp, Gmail,
Downloads, etc., choose **File Viewer** and pick **Always** to make it the default.
Files can also be sent to it with **Share**, or opened from inside the app.

- **Spreadsheets:** Excel-style grid with column letters and row numbers, sheet tabs,
  merged cells, number/date/currency formats, text that spills into empty cells,
  tap a cell to see (and copy) its full value, pinch or double-tap to zoom. Large
  sheets are parsed off the main thread and rendered virtually.
- **PDFs:** continuous scrolling with each page fitted to the screen width, pinch or
  double-tap to zoom, page indicator with go-to-page, and password-protected PDFs.
- **Recent files:** the last 20 files are kept on the device so they can be reopened.
  Nothing is uploaded; everything is processed on the phone.

How it works: `IncomingFilePlugin.java` receives the `VIEW`/`SEND` intent, copies the
document into the app's cache and emits a `fileOpened` event that `src/lib/native.ts`
turns into a `File` for the viewer.

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
