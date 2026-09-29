# File Viewer - Download & Setup Guide

## 📥 Download Your Builds

### Windows Executable Package 🖥️

**What you need:**
1. The built `dist/` folder (contains the web app)
2. One of the launcher scripts

**Launcher Options:**
- **`launch-app.vbs`** (Recommended) - VBScript launcher
  - Works automatically on Windows 7, 8, 10, 11
  - Tries Python first, then Node.js, then opens HTML
  
- **`File-Viewer.bat`** - Batch file launcher
  - Simple command-line start
  - Shows a console window

**Setup Steps:**

1. **Clone or Download**
   ```bash
   git clone https://github.com/SN1502/file-viewer-app.git
   cd file-viewer-app
   ```

2. **Build the app (if not already built)**
   ```bash
   npm install
   npm run build
   ```

3. **Create your launch folder**
   - Create a folder: `File-Viewer-Windows`
   - Copy `dist/` folder into it
   - Copy either `launch-app.vbs` or `File-Viewer.bat` into it

4. **Run the app**
   - Double-click `launch-app.vbs` (or `File-Viewer.bat`)
   - Browser will open at `http://localhost:8888`

5. **Upload files**
   - Upload Excel (.xlsx), CSV, or PDF files
   - View them in the app

### Android APK 📱

**Automatic Builds:**
- Go to: https://github.com/SN1502/file-viewer-app/actions
- Click "Build APK" workflow
- Download artifact from the latest run

**Manual Build (Advanced):**
```bash
npm install
npm run build
npx cap add android
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

**Installation:**
1. Download APK to your Android device
2. Go to Settings → Security → Enable "Unknown sources"
3. Open file manager and tap the APK
4. Follow installation prompts

## 🚀 Quick Start

### Windows (Fastest)

```
1. Clone: git clone https://github.com/SN1502/file-viewer-app.git
2. Build: npm install && npm run build
3. Create folder with dist/ + launch-app.vbs
4. Double-click launch-app.vbs
5. Done! 🎉
```

### Android

```
1. Go to GitHub Actions
2. Download APK from latest build
3. Install on Android phone
4. Open and enjoy!
```

## 📋 Requirements

### For Windows

**Minimum:**
- Windows 7, 8, 10, or 11
- At least 100 MB free disk space

**Recommended (for better performance):**
- Python 3.6+ OR Node.js 14+
- 4 GB RAM
- Modern browser

### For Android

- Android 8.0 or higher
- 100 MB free storage
- Touchscreen device

## 🔧 Troubleshooting

### Windows launcher won't work

**Try this:**
1. Install Python from: https://www.python.org
2. During installation, check "Add Python to PATH"
3. Try again

Or install Node.js from: https://nodejs.org

### App won't start

1. Make sure `dist/` folder is in the same directory as launcher script
2. Check that `dist/index.html` exists
3. Try opening `dist/index.html` directly in browser

### Port 8888 already in use

Edit launcher script and change `8888` to `9999`

### Files won't upload

1. Drag files onto the upload area (don't click)
2. Or try refreshing browser (F5) and try again
3. Check file format: `.xlsx`, `.xls`, `.csv`, or `.pdf`

## 📦 Package Contents

```
file-viewer-app/
├── src/                      # React source code
│   ├── App.tsx
│   ├── components/
│   │   ├── FileViewer.tsx
│   │   ├── FileUpload.tsx
│   │   └── viewers/
│   │       ├── ExcelViewer.tsx
│   │       ├── CSVViewer.tsx
│   │       └── PDFViewer.tsx
│   ├── utils/
│   │   └── fileParser.ts
│   └── styles/
│
├── dist/                     # Built app (after npm run build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.css
│   │   └── index-*.js
│
├── android/                  # Android project
│   └── app/build/outputs/apk/release/
│       └── app-release.apk
│
├── electron/                 # Electron for desktop
│   ├── main.js
│   └── preload.js
│
├── builds/                   # Windows launchers
│   ├── launch-app.vbs
│   └── File-Viewer.bat
│
├── .github/workflows/        # GitHub Actions
│   ├── build-apk.yml
│   └── build-windows.yml
│
├── package.json              # Dependencies
├── tsconfig.json
├── vite.config.ts
├── README.md
├── WINDOWS-SETUP.md          # Windows setup guide
├── BUILDS.md                 # Build info
└── QUICKSTART.md
```

## 🔐 Security & Privacy

✅ **No internet required** - Works completely offline
✅ **Files stay local** - Nothing is uploaded anywhere
✅ **No tracking** - No telemetry or analytics
✅ **Open source** - Code is visible on GitHub
✅ **Free** - No licensing fees

## 💾 System Resources

- **Disk space:** 100 MB minimum
- **RAM usage:** 50-150 MB
- **CPU:** Very light (won't slow down your computer)
- **Network:** None required

## 🎯 Supported File Formats

| Format | Extension | Features |
|--------|-----------|----------|
| Excel  | .xlsx, .xls | Sheet tabs, row expansion |
| CSV    | .csv | Table view, expandable rows |
| PDF    | .pdf | Page nav, zoom 50%-200% |

## 🚀 Advanced Usage

### Running as portable app

1. Copy `dist/` and launcher to USB drive
2. Run from USB on any Windows computer
3. No installation needed

### Setting custom port

Edit launcher script and change:
- `8888` to your preferred port (e.g., `3000`, `5000`, etc.)

### Hosting online

1. Upload `dist/` contents to your web server
2. Access via browser at your URL
3. Add SSL certificate for security

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Build Electron desktop app
npm run electron-build

# Build Android APK
npm run cap build android
```

## 📞 Support

**Issue with the app?**
1. Check WINDOWS-SETUP.md for troubleshooting
2. Visit: https://github.com/SN1502/file-viewer-app/issues
3. Create new issue with details and file examples

## 📝 License

MIT License - Free for personal and commercial use

## ✨ Features Included

✅ Multi-file support (open multiple files)
✅ Dark mode support
✅ Responsive design
✅ Drag-and-drop upload
✅ Offline operation
✅ No installation required (Windows)
✅ Mobile-optimized
✅ Fast performance

## 🔄 Updates

Check GitHub for latest version:
https://github.com/SN1502/file-viewer-app/releases

Each release includes:
- APK for Android
- Windows executables
- Documentation
- Source code

---

**Happy file viewing! 📄✨**

Questions? Visit the GitHub repository!
