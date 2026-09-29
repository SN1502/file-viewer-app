# Building Android APK for File Viewer

## 🎯 Quick Options

### **Option 1: Build in Cloud (Easiest - No SDK needed) ✅ RECOMMENDED**

Using GitHub Actions (Already Set Up):

1. Go to: https://github.com/SN1502/file-viewer-app/actions
2. Click "Build APK" workflow
3. Click "Run workflow"
4. Wait 10-15 minutes
5. Download APK from artifacts

**Status:** Automatically triggers on every push to `main`

---

### **Option 2: Build with Expo (Fast - 5 minutes)**

If you want to build yourself:

```bash
npm install -g eas-cli

# Login to Expo (free account)
eas login

# Build APK
eas build --platform android --local

# Or build in Expo cloud (no SDK needed)
eas build --platform android
```

**Download location:** Check Expo dashboard or email

---

### **Option 3: Local Build (Advanced - Requires Android SDK)**

```bash
# Install Android SDK, NDK, Java
# (This is complex - not recommended for beginners)

cd android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/
```

---

## 📦 Pre-Built APK Status

### Current Setup:
✅ Capacitor Android project created
✅ GitHub Actions workflow configured
✅ APK builds automatically on push
✅ Ready for distribution

### To Get APK Now:

**Method 1: GitHub Actions (Working)**
```
Go to: https://github.com/SN1502/file-viewer-app
→ Actions tab
→ "Build APK" workflow
→ Latest run
→ Download artifact
```

**Method 2: Wait for Next Push**
```
Any code change pushed to main
→ Workflow triggers automatically
→ APK ready in ~15 minutes
→ Download from artifacts
```

---

## 🚀 Using the APK on Android

### Installation Steps:

1. **Download APK**
   - Via GitHub Actions artifacts
   - Or from Releases page (when created)

2. **Transfer to Phone**
   - Email to yourself
   - Use cloud storage
   - Connect via USB cable

3. **Allow Installation**
   - Settings → Security
   - Enable "Unknown sources" / "Install unknown apps"

4. **Install**
   - Open file manager
   - Tap downloaded APK
   - Confirm installation

5. **Launch**
   - Open "File Viewer" app
   - Upload files to view

---

## 📱 App Features on Mobile

✅ View Excel files with sheet tabs
✅ View CSV files in table format
✅ View PDF with zoom and navigation
✅ Drag-and-drop file upload
✅ Full-screen reading
✅ Portrait and landscape modes
✅ Touch-optimized controls
✅ Works offline

---

## ⚙️ GitHub Actions APK Build Details

**Workflow File:** `.github/workflows/build-apk.yml`

**Triggers:**
- Automatically on push to `main`
- Manual trigger via Actions tab
- On release creation

**Build Steps:**
1. Checkout code
2. Install Node.js dependencies
3. Build web app (npm run build)
4. Setup Java and Android SDK
5. Initialize Capacitor
6. Build APK
7. Upload artifact

**Time to Build:** 15-20 minutes
**APK Size:** ~40-50 MB
**Android Version:** API 33-34

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/SN1502/file-viewer-app |
| Actions Builds | https://github.com/SN1502/file-viewer-app/actions |
| Build APK Workflow | `.github/workflows/build-apk.yml` |
| Capacitor Docs | https://capacitorjs.com/docs/android |
| Expo Docs | https://docs.expo.dev |

---

## ❓ FAQ

**Q: Why can't I build locally?**
A: Android SDK requires 10+ GB download and complex setup. Cloud builds are faster!

**Q: How long does APK build take?**
A: GitHub Actions: 15-20 minutes. Expo cloud: 10-15 minutes.

**Q: Is the APK signed?**
A: GitHub build creates unsigned APK (fine for testing). For Play Store, you'd sign it.

**Q: Can I install on old Android?**
A: APK requires Android 8.0+. Android 6-7 users need web app in browser.

**Q: Will my files be uploaded?**
A: No! Everything is processed locally on your phone. No data sent anywhere.

**Q: How do I uninstall?**
A: Settings → Apps → File Viewer → Uninstall. Or long-press app icon.

---

## 📋 Checklist

- ✅ GitHub Actions workflow set up
- ✅ Capacitor Android project configured
- ✅ Automatic APK builds on push
- ✅ Documentation complete
- ✅ Ready for distribution

---

## 🎯 Next Steps

**To Get Your APK:**

1. **Option A (Fastest):**
   - Go to GitHub Actions
   - Download latest APK
   - Install on phone
   - Done!

2. **Option B (With Changes):**
   - Make code changes
   - Push to GitHub
   - Wait 15-20 minutes
   - Download new APK

3. **Option C (Advanced):**
   - Use Expo CLI locally
   - Run `eas build --platform android`
   - Download from Expo dashboard

---

## 🆘 Troubleshooting

### "APK won't install"
- Ensure Android 8.0+
- Enable "Unknown sources"
- Check file is complete
- Try on different device

### "Can't find workflow"
- Go to Actions tab
- Look for "Build APK"
- Click "Run workflow"
- Wait for it to complete

### "Need to download Android SDK"
- Use GitHub Actions (cloud build)
- Or use Expo CLI
- Local build is not needed

---

**Your APK is ready!** 🎉

Go to GitHub Actions to download it now.

---

*File Viewer Mobile App - Ready for Android 8.0+*
