# File Viewer - Build Packages

This document describes the available build packages for File Viewer.

## Windows Executable (EXE) 🖥️

### Available Packages

**File-Viewer-Windows.exe** (7.5 MB)
- Standalone executable application
- No installation required
- Compatible with Windows 7, 8, 10, 11
- Double-click to run

### How to Use

1. Download `File-Viewer-Windows.exe`
2. Double-click to launch
3. A browser window will automatically open
4. The app will start a local web server at `http://127.0.0.1:8888`

### System Requirements

- Windows 7, 8, 10, or 11
- .NET Framework 4.5 or later (usually pre-installed)
- At least 100 MB free disk space
- No internet connection required for operation

### Features

- View Excel files (.xlsx, .xls) with sheet navigation
- View CSV files with table display
- View PDF files with zoom and page navigation
- Drag-and-drop file upload
- Responsive design works on desktop

## Android APK (Mobile) 📱

### Building the APK

The APK is built automatically via GitHub Actions when you push code to the repository.

**Automatic Build Process:**
1. Push code to `main` branch
2. GitHub Actions workflow triggers automatically
3. APK is built and available in the workflow artifacts
4. Create a release tag to attach APK to GitHub release

**To Download:**
1. Go to: https://github.com/SN1502/file-viewer-app
2. Click on "Actions" tab
3. Select the latest "Build APK" workflow
4. Download the artifact from the workflow run

### Manual Build (Requires Android SDK)

```bash
# Install dependencies
npm install

# Build web app
npm run build

# Build APK (requires Android SDK/NDK, Java JDK)
cd android
./gradlew assembleRelease
```

### System Requirements (Android)

- Android 8.0 (API Level 26) or higher
- At least 100 MB free storage space

### Features

- View Excel files with sheet tabs and row expansion
- View CSV files with scrollable tables
- View PDF files with zoom and navigation
- Full mobile-optimized interface
- Touch-friendly controls

## Release Tags for Automated Builds

To trigger a full build and create a release with artifacts:

```bash
# Create and push a version tag
git tag -a v1.0.0 -m "Version 1.0.0 release"
git push origin v1.0.0
```

This will:
1. Build Windows EXE automatically
2. Build Android APK automatically
3. Create a GitHub Release with both artifacts
4. Make them available for download

## Troubleshooting

### Windows EXE Issues

**"Windows protected your PC" message**
- This is normal for unsigned applications
- Click "More info" → "Run anyway"
- To avoid this, obtain a code signing certificate

**Port 8888 already in use**
- Another application is using port 8888
- Edit the source code to use a different port
- Rebuild the application

**File associations not working**
- Double-click the EXE directly or drag files onto the window
- The app doesn't require file associations

### Android APK Issues

**Installation fails on Android**
- Ensure "Unknown sources" is enabled in Settings
- Try installing on Android 8.0 or higher
- Check that you have enough storage space

**PDF rendering is slow**
- This is normal for large PDF files on mobile
- The app renders one page at a time
- Zoom might take a moment to adjust

## Advanced: Creating Your Own Installers

### Windows NSIS Installer

If you want to create a professional NSIS installer:

```bash
# Install NSIS (on Windows)
# Download from: https://nsis.sourceforge.io

# Build installer
makensis FileViewerInstaller.nsi
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/SN1502/file-viewer-app.git
cd file-viewer-app

# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Run in Electron (Windows/macOS/Linux)
npm run electron-build

# Build APK
npm run cap build android
```

## Distribution

### GitHub Releases

The easiest way to distribute:
1. Push code and create version tags
2. GitHub Actions automatically builds and releases
3. Users download from Releases page
4. Artifacts are versioned and documented

### Self-Hosting

To host on your own server:
1. Build applications locally
2. Upload to your web server
3. Create download links
4. Include in documentation

## Support

For issues or questions:
1. Check GitHub Issues: https://github.com/SN1502/file-viewer-app/issues
2. Review this documentation
3. Check application logs in the browser console (F12)

## Version Info

- **Current Version:** 1.0.0
- **Build Date:** 2026-09-29
- **Last Updated:** 2026-09-29
