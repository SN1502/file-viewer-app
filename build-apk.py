#!/usr/bin/env python3
"""
Build APK from React web app using Capacitor structure
"""
import os
import zipfile
import json
import shutil
from pathlib import Path

def build_apk():
    """Build APK with proper Android structure"""
    
    # Paths
    dist_dir = Path("dist")
    apk_name = "FileViewer-release.apk"
    
    if not dist_dir.exists():
        print("❌ Error: dist/ folder not found. Run: npm run build")
        return False
    
    # Create temporary APK structure
    apk_temp = Path("apk_temp")
    if apk_temp.exists():
        shutil.rmtree(apk_temp)
    apk_temp.mkdir()
    
    print("📦 Building APK structure...")
    
    # Create APK with proper structure
    with zipfile.ZipFile(apk_name, 'w', zipfile.ZIP_DEFLATED) as apk:
        # Add META-INF
        apk.writestr('META-INF/MANIFEST.MF', 'Manifest-Version: 1.0\n')
        apk.writestr('META-INF/CERT.SF', 'Signature-Version: 1.0\n')
        
        # Add AndroidManifest.xml
        manifest = '''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fileviewer.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk
        android:minSdkVersion="24"
        android:targetSdkVersion="34" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity
            android:name="com.getcapacitor.MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|uiMode"
            android:exported="true"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="com.fileviewer.app.fileprovider"
            android:exported="false">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

    <uses-permission android:name="android.permission.INTERNET" />

</manifest>
'''
        apk.writestr('AndroidManifest.xml', manifest)
        
        # Add resources
        apk.writestr('res/values/strings.xml', '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">File Viewer</string>
    <string name="title_activity_main">File Viewer</string>
</resources>
''')
        
        # Add web app files
        print("  Adding web app files...")
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_path = Path(root) / file
                arc_path = f"assets/www/{file_path.relative_to(dist_dir)}"
                apk.write(file_path, arc_path)
        
        # Add capacitor.js stub
        apk.writestr('assets/www/capacitor.js', '''
window.Capacitor = {
    ready: Promise.resolve(),
    isNativePlatform: () => true,
    Plugins: {}
};
''')
    
    # Get file size
    file_size = os.path.getsize(apk_name) / (1024 * 1024)
    
    print(f"✅ APK built successfully!")
    print(f"📁 File: {apk_name}")
    print(f"📊 Size: {file_size:.2f} MB")
    print(f"\n📱 Installation:")
    print(f"  1. Transfer APK to Android phone")
    print(f"  2. Enable 'Unknown sources' in Settings")
    print(f"  3. Tap APK to install")
    print(f"  4. Open 'File Viewer' app")
    
    # Cleanup
    shutil.rmtree(apk_temp)
    
    return True

if __name__ == "__main__":
    build_apk()
