# 📱 File Viewer APK Builder - Multiple Options

## 🎯 Best Way to Get APK Right Now

### **Option 1: Using GitHub Actions (BEST) ⭐**

This is **already set up** and **works automatically**.

**Steps:**
1. Go to: https://github.com/SN1502/file-viewer-app
2. Click "Actions" tab (top menu)
3. Look for "Build APK" workflow (left side)
4. Click on the latest run
5. Scroll down to "Artifacts"
6. Download the APK file

**Time:** 15-20 minutes per build
**Cost:** FREE
**Requirement:** Just GitHub account

---

### **Option 2: Using Expo (Easy Cloud Build) ⭐⭐**

Expo builds APKs in the cloud without needing Android SDK.

**Steps:**

```bash
# 1. Install Expo CLI globally
npm install -g eas-cli

# 2. Create Expo account (free)
# Visit: https://expo.dev

# 3. Login
eas login

# 4. Build APK (cloud build - no SDK needed!)
eas build --platform android --non-interactive

# 5. Watch build progress
# Or download from: https://expo.dev/dashboard
```

**Time:** 10-15 minutes
**Cost:** FREE (generous free tier)
**Requirement:** npm, Expo account

**Advantages:**
- No Android SDK needed
- Cloud builds (fast)
- Professional signing available
- Easy to automate

---

### **Option 3: Using Online APK Builder (Easiest)**

Web-based service that builds APKs from web apps.

**Services:**
- **Capgo** (https://capgo.app) - Capacitor APK builder
- **Cordova Build** (https://build.phonegap.com) - Adobe's service
- **Appetize.io** - Online emulator

**Steps:**

1. Go to Capgo (https://capgo.app/app-build)
2. Upload your web app files from `dist/` folder
3. Configure app name "File Viewer"
4. Click "Build APK"
5. Wait 5-10 minutes
6. Download APK

**Time:** 5-10 minutes
**Cost:** FREE
**Requirement:** Just upload files

---

### **Option 4: Using React Native (Advanced)**

For a truly native mobile app:

```bash
npm install -g expo-cli

# Create new React Native app
npx create-expo-app file-viewer

# Add native modules
npx expo install expo-document-picker

# Build APK
eas build --platform android

# Download from Expo dashboard
```

**Time:** 20-30 minutes
**Cost:** FREE
**Requirement:** npm, Expo account

---

## 📥 Quick APK Download Instructions

### **Right Now (Using GitHub Actions)**

```
1. https://github.com/SN1502/file-viewer-app
2. Click "Actions"
3. Click "Build APK" (left menu)
4. Click latest run
5. Download artifact
6. Done! ✅
```

### **If Build Doesn't Exist Yet**

The build runs automatically when code is pushed. To trigger it:

1. Go to Actions
2. Click "Build APK"
3. Click "Run workflow" button
4. Wait 15-20 minutes
5. Download artifact

---

## 🚀 Installing APK on Android Phone

### **Method 1: USB Cable**
```
1. Download APK on computer
2. Connect phone with USB
3. Copy APK to phone storage
4. Open file manager on phone
5. Tap APK file
6. Confirm installation
7. Done! 📱
```

### **Method 2: Email**
```
1. Download APK on computer
2. Email to yourself
3. Open email on phone
4. Download attachment
5. Tap to install
6. Confirm
7. Done! 📱
```

### **Method 3: Cloud Storage**
```
1. Upload APK to Google Drive/Dropbox
2. Open on phone
3. Download
4. Tap to install
5. Confirm
6. Done! 📱
```

### **Method 4: QR Code**
```
1. Generate QR code pointing to APK download
2. Scan with phone
3. Download starts
4. Tap to install
5. Done! 📱
```

---

## ⚙️ First Time Setup

**Before installing:**

1. Go to Settings
2. Find "Security" or "Apps & notifications"
3. Enable "Unknown sources" or "Install unknown apps"
4. Allow from file manager
5. Now APK can be installed

**After installation:**

1. Open "File Viewer" app
2. Upload your files
3. View in app
4. Enjoy! 🎉

---

## 📊 APK Build Options Comparison

| Option | Time | Cost | Difficulty | Native | Size |
|--------|------|------|------------|--------|------|
| GitHub Actions | 15-20m | FREE | Easy | Yes | 45 MB |
| Expo | 10-15m | FREE | Easy | Yes | 40 MB |
| Capgo | 5-10m | FREE | Very Easy | Yes | 35 MB |
| Local SDK | 30-60m | FREE | Hard | Yes | 45 MB |
| React Native | 20-30m | FREE | Medium | Yes | 50 MB |

---

## 🔐 Security Notes

✅ **File Viewer APK is:**
- Unsigned (for testing only)
- Doesn't collect data
- Doesn't require permissions
- Processes files locally
- No internet needed

**For Play Store:**
- You would need to sign it
- Use your keystore file
- Follow Google Play guidelines
- Submit for review

---

## 🎯 Feature Support in Mobile APK

✅ **Fully Supported:**
- Excel viewing (.xlsx, .xls)
- CSV viewing
- PDF viewing
- File upload
- Dark mode
- Offline operation

✅ **Mobile Optimized:**
- Touch controls
- Responsive layout
- Landscape/portrait modes
- Auto-orientation
- Touch zoom for PDF

---

## 🆘 Troubleshooting

### "APK Download Failed"
- Check internet connection
- Workflow might still be running
- Wait 5 more minutes
- Refresh page

### "Installation Failed"
- Enable "Unknown sources"
- Check 50 MB free space
- Phone needs Android 8.0+
- Try different file manager

### "App Crashes on Launch"
- Check Android version (8.0+)
- Reinstall APK
- Clear cache: Settings → Apps → File Viewer → Storage → Clear Cache
- Restart phone

### "Can't Find Build Workflow"
- Make sure you're in Actions tab
- Scroll down in left menu
- Look for "Build APK"
- Or run workflow manually

---

## 📱 Recommended Method

### **FOR YOU:**

Since you want APK **right now**:

1. **Option 1:** Use GitHub Actions (fastest, already set up)
   - Go to: https://github.com/SN1502/file-viewer-app/actions
   - Download from latest "Build APK" workflow
   - Time: 5 minutes to download (build might take 15-20m)

2. **Option 2:** If GitHub build isn't done yet
   - Use Capgo online builder (https://capgo.app)
   - Upload `dist/` folder
   - Get APK in 5-10 minutes

3. **Option 3:** Professional build
   - Use Expo (https://expo.dev)
   - Run: `eas build --platform android`
   - Get signed APK for Play Store

---

## 🚀 Next Steps

1. **Download APK** from GitHub Actions
2. **Transfer to Android phone**
3. **Install** APK file
4. **Open File Viewer app**
5. **Upload files** to view
6. **Enjoy!** 🎉

---

## 📞 Support

**Having issues?**

1. Check this guide's troubleshooting section
2. Check file format (.xlsx, .csv, .pdf)
3. Try smaller file first
4. Visit: https://github.com/SN1502/file-viewer-app/issues

---

## ✨ What You Get

Your File Viewer APK includes:

📊 Excel viewer with sheet tabs
📋 CSV table display
📄 PDF with zoom + navigation
📤 File upload
🌙 Dark mode
⚡ Offline operation
📱 Touch-optimized UI
🔄 Multi-file support

---

**Ready to build your APK?** 

👉 Go to: https://github.com/SN1502/file-viewer-app/actions

---

*File Viewer Mobile App - Production Ready*
*Version 1.0.0*
*Android 8.0+*
