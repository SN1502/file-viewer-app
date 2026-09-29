import { ArrowLeft, FolderOpen, LoaderCircle } from 'lucide-react';
import { lazy, Suspense } from 'react';
import type { OpenDocument } from '../App';
import { typeLabel } from '../lib/fileTypes';
import { formatBytes } from '../lib/format';
import { FileIcon } from './FileIcon';

// Loaded on demand so the home screen starts fast.
const PdfViewer = lazy(() => import('./pdf/PdfViewer'));
const SpreadsheetViewer = lazy(() => import('./spreadsheet/SpreadsheetViewer'));

interface Props {
  doc: OpenDocument;
  onBack(): void;
  onOpenAnother(): void;
}

export default function DocumentScreen({ doc, onBack, onOpenAnother }: Props) {
  return (
    <div className="doc-screen">
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <FileIcon kind={doc.kind} size={30} />
        <div className="topbar-title">
          <h1 title={doc.name}>{doc.name}</h1>
          <p>
            {typeLabel(doc.name, doc.kind)} · {formatBytes(doc.size)}
          </p>
        </div>
        <button className="icon-btn" onClick={onOpenAnother} aria-label="Open another file">
          <FolderOpen size={22} />
        </button>
      </header>

      <main className="doc-body">
        <Suspense
          fallback={
            <div className="viewer-message">
              <LoaderCircle className="spin" size={32} />
            </div>
          }
        >
          {doc.kind === 'pdf' ? (
            <PdfViewer file={doc.file} />
          ) : (
            <SpreadsheetViewer file={doc.file} kind={doc.kind} name={doc.name} />
          )}
        </Suspense>
      </main>
    </div>
  );
}
