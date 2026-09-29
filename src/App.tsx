import { useState } from 'react';
import { FileText, X, ChevronLeft, ChevronRight } from 'lucide-react';
import FileViewer from './components/FileViewer';
import FileUpload from './components/FileUpload';
import './App.css';

interface FileData {
  name: string;
  type: 'excel' | 'csv' | 'pdf';
  data: any;
  rawFile?: File;
}

function App() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);

  const handleFileUpload = (newFiles: FileData[]) => {
    setFiles([...files, ...newFiles]);
    if (activeFileIndex === null && newFiles.length > 0) {
      setActiveFileIndex(0);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    if (activeFileIndex === index) {
      if (newFiles.length > 0) {
        setActiveFileIndex(newFiles.length - 1 === index ? index - 1 : index);
      } else {
        setActiveFileIndex(null);
      }
    } else if (activeFileIndex !== null && activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  const activeFile = activeFileIndex !== null ? files[activeFileIndex] : null;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📄 File Viewer</h1>
        <p>View Excel, CSV, and PDF files on mobile</p>
      </header>

      <div className="app-content">
        {files.length === 0 ? (
          <FileUpload onFilesUpload={handleFileUpload} />
        ) : (
          <div className="viewer-layout">
            <div className="file-list-sidebar">
              <div className="sidebar-header">
                <h2>Files ({files.length})</h2>
              </div>
              <div className="file-list">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`file-item ${activeFileIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    <div className="file-item-content">
                      <FileText size={16} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-type">{file.type.toUpperCase()}</span>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <FileUpload onFilesUpload={handleFileUpload} compact />
            </div>

            <div className="viewer-main">
              {activeFile ? (
                <>
                  <div className="viewer-header">
                    <h2>{activeFile.name}</h2>
                    <div className="nav-buttons">
                      <button
                        disabled={activeFileIndex === 0}
                        onClick={() => setActiveFileIndex(Math.max(0, (activeFileIndex ?? 0) - 1))}
                        className="nav-btn"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="file-counter">
                        {(activeFileIndex ?? 0) + 1} / {files.length}
                      </span>
                      <button
                        disabled={activeFileIndex === files.length - 1}
                        onClick={() => setActiveFileIndex(Math.min(files.length - 1, (activeFileIndex ?? 0) + 1))}
                        className="nav-btn"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <FileViewer file={activeFile} />
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
