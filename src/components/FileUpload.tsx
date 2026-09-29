import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseExcel, parseCSV, parsePDF } from '../utils/fileParser';
import '../styles/FileUpload.css';

interface FileUploadProps {
  onFilesUpload: (files: any[]) => void;
  compact?: boolean;
}

export default function FileUpload({ onFilesUpload, compact = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setLoading(true);
    setError(null);

    try {
      const parsedFiles = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = file.name;
        const fileExt = fileName.split('.').pop()?.toLowerCase();

        let parsedData;
        let fileType: 'excel' | 'csv' | 'pdf' | null = null;

        if (fileExt === 'xlsx' || fileExt === 'xls') {
          parsedData = await parseExcel(file);
          fileType = 'excel';
        } else if (fileExt === 'csv') {
          parsedData = await parseCSV(file);
          fileType = 'csv';
        } else if (fileExt === 'pdf') {
          parsedData = await parsePDF(file);
          fileType = 'pdf';
        } else {
          setError(`Unsupported file type: ${fileExt}`);
          continue;
        }

        if (fileType) {
          parsedFiles.push({
            name: fileName,
            type: fileType,
            data: parsedData,
            rawFile: file,
          });
        }
      }

      if (parsedFiles.length > 0) {
        onFilesUpload(parsedFiles);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(`Error parsing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`file-upload ${compact ? 'compact' : ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv,.pdf,application/pdf,text/csv,text/comma-separated-values,application/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileSelect}
        disabled={loading}
        className="file-input"
      />

      {!compact ? (
        <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
          <Upload size={48} />
          <h2>Upload Files</h2>
          <p>Click to select or drag & drop</p>
          <p className="supported">Supported: Excel, CSV, PDF</p>
          <button className="upload-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Choose Files'}
          </button>
        </div>
      ) : (
        <button className="compact-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={loading}>
          <Upload size={16} />
          {loading ? 'Processing...' : 'Add More'}
        </button>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
