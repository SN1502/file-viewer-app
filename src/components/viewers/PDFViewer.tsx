import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// Bundle the worker with the app so PDFs render offline (inside the Android
// WebView and Electron) instead of fetching it from a CDN at runtime.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import '../../styles/PDFViewer.css';

interface PDFViewerProps {
  rawFile?: File;
  fileName?: string;
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PDFViewer({ rawFile, fileName: _fileName }: PDFViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!rawFile) return;

    const loadPDF = async () => {
      try {
        const arrayBuffer = await rawFile.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load PDF:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [rawFile]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom / 100 });
        const canvas = canvasRef.current;

        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) return;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (err) {
        console.error('Failed to render page:', err);
      }
    };

    renderPage();
  }, [pdf, currentPage, zoom]);

  if (loading) {
    return <div className="viewer-error">Loading PDF...</div>;
  }

  if (!pdf) {
    return <div className="viewer-error">Failed to load PDF file</div>;
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const zoomOut = () => setZoom(Math.max(zoom - 25, 50));

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="control-group">
          <button onClick={prevPage} disabled={currentPage === 1} className="control-btn">
            <ChevronLeft size={20} />
          </button>
          <span className="page-info">
            {currentPage} / {totalPages}
          </span>
          <button onClick={nextPage} disabled={currentPage === totalPages} className="control-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="control-group">
          <button onClick={zoomOut} disabled={zoom <= 50} className="control-btn">
            <ZoomOut size={20} />
          </button>
          <span className="zoom-level">{zoom}%</span>
          <button onClick={zoomIn} disabled={zoom >= 200} className="control-btn">
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      <div className="pdf-canvas-container">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>

      <div className="pdf-footer">
        <p>Page {currentPage} of {totalPages}</p>
      </div>
    </div>
  );
}
