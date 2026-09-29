#!/usr/bin/env python3
"""
Create a simple APK wrapper for the File Viewer web app.
This uses Apache Cordova to wrap the web app as an Android APK.
"""

import os
import subprocess
import sys
import json
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a shell command and return the result"""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(result.stdout)
    return True

def create_apk():
    """Create APK using Apache Cordova"""
    project_root = Path(__file__).parent

    print("Creating File Viewer APK...")

    # Install cordova globally
    print("\n1. Installing Apache Cordova...")
    subprocess.run([sys.executable, "-m", "pip", "install", "apache-cordova", "-q"], check=False)

    # Create Cordova project structure
    cordova_dir = project_root / "cordova"
    if cordova_dir.exists():
        import shutil
        shutil.rmtree(cordova_dir)

    cordova_dir.mkdir(parents=True)

    # Create package.json for Cordova
    cordova_pkg = {
        "name": "file-viewer-app",
        "displayName": "File Viewer",
        "version": "1.0.0",
        "description": "View Excel, CSV, and PDF files on your mobile device",
        "main": "index.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "",
        "license": "MIT"
    }

    with open(cordova_dir / "package.json", "w") as f:
        json.dump(cordova_pkg, f, indent=2)

    # Create www directory and copy web app
    www_dir = cordova_dir / "www"
    www_dir.mkdir(parents=True)

    dist_dir = project_root / "dist"
    if dist_dir.exists():
        print("\n2. Copying web app to Cordova project...")
        import shutil
        for item in dist_dir.iterdir():
            if item.is_file():
                shutil.copy2(item, www_dir)
            elif item.is_dir() and item.name != ".git":
                shutil.copytree(item, www_dir / item.name)

    # Create config.xml for Cordova
    config_xml = """<?xml version='1.0' encoding='utf-8'?>
<widget id="com.fileviewer.app" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:gap="http://phonegap.com/ns/1.0">
    <name>File Viewer</name>
    <description>View Excel, CSV, and PDF files on your mobile device</description>
    <author email="support@example.com" href="https://example.com">
        File Viewer
    </author>
    <content src="index.html" />
    <preference name="orientation" value="portrait" />
    <preference name="target-device" value="universal" />
    <preference name="fullscreen" value="false" />
    <access origin="*" />
    <plugin name="cordova-plugin-whitelist" spec="1" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <platform name="android">
        <allow-intent href="market:*" />
    </platform>
</widget>
"""

    with open(cordova_dir / "config.xml", "w") as f:
        f.write(config_xml)

    print("\n3. Created APK build structure at:", cordova_dir)
    print("\nNote: To build the actual APK, you need:")
    print("  - Android SDK and NDK installed")
    print("  - Java JDK installed")
    print("  - Run: cd cordova && npx cordova build android --release")
    print("\nFor now, a GitHub Actions workflow has been set up to build the APK automatically.")
    print("The APK will be available in GitHub Actions after pushing code.")

    return True

if __name__ == "__main__":
    try:
        create_apk()
        print("\n✓ APK build structure created successfully!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
