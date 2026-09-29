# File Viewer - Windows Setup Guide

## Quick Start

### Option 1: Using VBScript Launcher (Recommended - Windows 7/8/10/11)

1. **Extract the files**
   - Extract the File Viewer application package to a folder

2. **Launch the app**
   - Double-click `launch-app.vbs` 
   - A browser window will automatically open
   - The app will be ready to use

3. **Upload files**
   - Drag and drop Excel, CSV, or PDF files into the app
   - Or click the upload area to select files

### Option 2: Using Batch Launcher

1. Extract the files
2. Double-click `File-Viewer.bat`
3. A command window will open
4. Your default browser will launch automatically

## Requirements

The app requires ONE of the following to run:

### Option A: Python 3 (Easiest)
- Python 3.6 or later
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"

### Option B: Node.js
- Node.js 14 or later
- Download from: https://nodejs.org/
- During installation, select "Add to PATH"

### Option C: Just a Browser
- If Python and Node.js aren't installed, the app will open `index.html` directly in your browser
- Some features may be limited but basic functionality will work

## Supported Windows Versions

✅ Windows 7 (with SP1)
✅ Windows 8 / 8.1
✅ Windows 10
✅ Windows 11

## System Requirements

- **Processor:** Intel Core 2 Duo or equivalent (2008 or later)
- **RAM:** 2 GB minimum (4 GB recommended)
- **Storage:** 100 MB free space
- **Display:** 1024x600 resolution minimum
- **Internet:** NOT required (works offline)

## Troubleshooting

### "Windows protected your PC" Message

This appears when running unsigned applications. This is normal.

**Solution:**
1. Click "More info"
2. Click "Run anyway"
3. The app will launch

To prevent this:
- Obtain a Microsoft code signing certificate (paid)
- Or disable SmartScreen protection (not recommended)

### "Python not found" or "Node.js not found"

**Solution:**
1. Install Python from https://www.python.org/downloads/
2. Restart your computer
3. Try again

Or use the VBScript launcher which will try multiple methods.

### Port 8888 Already in Use

If another application is using port 8888:

**Quick fix:**
- Close the other application using port 8888
- Restart File Viewer

**Permanent fix (requires editing):**
- Open `File-Viewer.bat` in Notepad
- Change `8888` to `9999` (or another number)
- Save and run again

### App opens but files won't upload

1. Drag files onto the upload area (don't click upload)
2. Or click to select files one at a time
3. Ensure files are: `.xlsx`, `.xls`, `.csv`, or `.pdf`
4. Check file size (large files may take time to process)

### App is slow

1. Close other applications to free up RAM
2. Restart the application
3. Try with smaller files first
4. Refresh the browser (F5)

## Features

### Excel Files (.xlsx, .xls)
- View all sheets with tab navigation
- Expand rows to see all columns
- Scroll through large spreadsheets
- See row counts and sheet names

### CSV Files
- Display as interactive table
- Expand rows for details
- Sortable and scrollable
- Handles large CSV files

### PDF Files
- Navigate pages (Previous/Next buttons)
- Zoom in/out (50% to 200%)
- See current page and total pages
- Supports all PDF formats

## Advanced: Running Without Browser

If you want to develop or customize:

```bash
# Install dependencies
pip install -r requirements.txt

# Or with Node.js
npm install

# Run development server
python -m http.server 8888 --directory dist
# Or
npx http-server dist -p 8888
```

## Uninstalling

1. Delete the File Viewer folder
2. The app is portable - no system changes were made
3. No registry entries to clean up

## Getting Help

1. **Check the app's built-in help** (if available)
2. **Try refreshing** the page (F5)
3. **Restart the application**
4. **Check file format** - ensure it's not corrupted
5. **Try a different file** to narrow down the issue

## Privacy & Security

✅ No internet connection required
✅ Files stay on your computer
✅ No data collection
✅ Completely offline operation
✅ No tracking or telemetry

## Performance Tips

1. Close other applications before opening large files
2. Restart the app if it becomes slow
3. For PDFs over 100 pages, zoom gradually
4. Split very large CSVs into smaller files
5. Keep your system RAM free

## Command Line Options

If you're comfortable with command line:

```bash
# Start on port 9000 instead of 8888
python -m http.server 9000 --directory dist

# With Node.js on port 8000
npx http-server dist -p 8000

# Specify a different directory
python -m http.server --directory /path/to/files
```

## Technical Details

- **Framework:** React 18 with TypeScript
- **Build tool:** Vite
- **File parsing:** XLSX, PapaParse, PDF.js
- **Server:** Python's built-in HTTP server or Node.js http-server
- **Browser:** Uses your default system browser

## Version Information

- **App Version:** 1.0.0
- **Build Date:** 2026-09-29
- **Compatibility:** Windows 7, 8, 10, 11
- **Architecture:** x64 (64-bit)

## Support

For issues or feature requests:
1. Visit: https://github.com/SN1502/file-viewer-app
2. Create an issue with details
3. Include file examples if possible

---

**Enjoy using File Viewer! 📄**
