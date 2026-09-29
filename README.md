# 📄 Multi-File Viewer - React Mobile App

A production-ready React TypeScript application for viewing Excel, CSV, and PDF files on mobile devices. Optimized for touch interfaces with support for multiple file formats and detailed data viewing.

## ✨ Features

### 📊 File Format Support
- **Excel** (.xlsx, .xls) - Multiple sheets, expandable rows, column preview
- **CSV** (.csv) - Tabular data viewer with row expansion
- **PDF** (.pdf) - Full PDF rendering with zoom and pagination

### 📱 Mobile Optimized
- Responsive design optimized for all screen sizes
- Touch-friendly interface with large tap targets
- Side-by-side panel layout on desktop, stacked on mobile
- Adaptive column display for narrow screens

### 🎯 Core Features
- **Multi-file Support** - Upload and manage multiple files
- **File Management** - View file list, remove files, navigate between them
- **Sheet Navigation** - Switch between Excel sheets seamlessly
- **Row Expansion** - Click to see all columns for any row
- **PDF Controls** - Page navigation, zoom in/out, page counter
- **Dark Mode** - Automatic light/dark theme support
- **Error Handling** - Graceful error messages and recovery

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
cd file-viewer
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## 📦 Project Structure

```
src/
├── App.tsx
├── components/
│   ├── FileUpload.tsx
│   ├── FileViewer.tsx
│   └── viewers/
│       ├── ExcelViewer.tsx
│       ├── CSVViewer.tsx
│       └── PDFViewer.tsx
├── utils/
│   └── fileParser.ts
├── styles/
│   ├── App.css
│   ├── FileUpload.css
│   ├── ExcelViewer.css
│   ├── CSVViewer.css
│   └── PDFViewer.css
└── main.tsx
```

## 🛠️ Technology Stack

- React 18 with TypeScript
- Vite (build tool)
- XLSX (Excel parsing)
- PapaParse (CSV parsing)
- PDF.js (PDF rendering)
- Lucide React (icons)

## 📱 Mobile Features

- Touch-optimized interface
- Responsive design (desktop & mobile)
- Dark mode support
- Adaptive layout
- Large tap targets

## 🎯 Usage

1. Upload Excel, CSV, or PDF files
2. Click files in the sidebar to view
3. Use expand arrows to see all columns
4. Navigate PDF pages with controls
5. Remove files with the X button

## 🚀 Deployment

The `dist/` folder is ready for deployment to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any CDN

Simply upload the contents of `dist/` to your hosting provider.
