import { useState, useEffect } from 'react';
import ExcelViewer from './viewers/ExcelViewer';
import CSVViewer from './viewers/CSVViewer';
import PDFViewer from './viewers/PDFViewer';
import '../styles/FileViewer.css';

interface FileViewerProps {
  file: {
    name: string;
    type: 'excel' | 'csv' | 'pdf';
    data: any;
    rawFile?: File;
  };
}

export default function FileViewer({ file }: FileViewerProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [file]);

  if (error) {
    return (
      <div className="viewer-error">
        <p>Error loading file: {error}</p>
      </div>
    );
  }

  try {
    switch (file.type) {
      case 'excel':
        return <ExcelViewer data={file.data} fileName={file.name} />;
      case 'csv':
        return <CSVViewer data={file.data} fileName={file.name} />;
      case 'pdf':
        return <PDFViewer rawFile={file.rawFile} fileName={file.name} />;
      default:
        return <div className="viewer-error">Unsupported file type</div>;
    }
  } catch (err) {
    return (
      <div className="viewer-error">
        <p>Error rendering file: {err instanceof Error ? err.message : 'Unknown error'}</p>
      </div>
    );
  }
}
