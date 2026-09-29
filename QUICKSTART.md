# Quick Start Guide

## 🎯 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 3. Upload Files
- Click "Choose Files" or drag & drop
- Select Excel, CSV, or PDF files
- View them immediately

## 📁 Key Files

- **App.tsx** - Main app logic
- **components/** - React components for different file types
- **utils/fileParser.ts** - File parsing logic
- **src/styles/** - CSS styling

## 🚀 Build for Production

```bash
npm run build
```

Output goes to `dist/` folder - ready to deploy!

## 🌐 Features Quick Reference

| Feature | Shortcut |
|---------|----------|
| Upload files | Click "Choose Files" |
| View file | Click in sidebar |
| Remove file | Click X button |
| Expand row | Click arrow on row |
| Next PDF page | Click right arrow |
| Zoom PDF | Click zoom buttons |

## 💡 Tips

- Works offline after first load
- Multiple files supported
- All data stays on your device
- Dark mode auto-detected
- Mobile responsive

## 🔧 Customization

Edit colors in `App.css`:
```css
:root {
  --primary: #3b82f6;      /* Blue */
  --error: #ef4444;        /* Red */
}
```

## 📱 Mobile Testing

```bash
# On macOS/Linux
npm run dev -- --host

# Then visit: http://[YOUR_IP]:5173
```

## ⚡ Performance

- PDF.js loaded from CDN
- Efficient table rendering
- Touch-optimized UI
- ~320KB gzipped (including all libraries)

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | `npm run dev -- --port 3000` |
| Build fails | Delete `node_modules` & run `npm install` |
| PDF not loading | Check browser console (F12) |

## 📚 Learn More

- React: https://react.dev
- Vite: https://vitejs.dev
- TypeScript: https://www.typescriptlang.org

---

**Happy file viewing! 📄✨**
