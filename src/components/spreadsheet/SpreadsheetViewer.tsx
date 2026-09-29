import { Check, CircleAlert, Copy, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ParseWorker from './parse.worker?worker';
import SheetGrid, { columnName, type CellRef } from './SheetGrid';
import type { ParseRequest, ParseResponse, SheetData } from './types';
import './spreadsheet.css';

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; sheets: SheetData[] };

interface Props {
  file: Blob;
  kind: 'workbook' | 'csv';
  name: string;
}

export default function SpreadsheetViewer({ file, kind, name }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<CellRef | null>(null);
  const [copied, setCopied] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const firstZoom = useRef(true);

  useEffect(() => {
    const worker = new ParseWorker();
    worker.onmessage = (event: MessageEvent<ParseResponse>) => {
      const result = event.data;
      setState(result.ok ? { status: 'ready', sheets: result.sheets } : { status: 'error', message: result.error });
      worker.terminate();
    };
    worker.onerror = (event) => {
      event.preventDefault();
      setState({ status: 'error', message: event.message || 'The spreadsheet could not be read.' });
      worker.terminate();
    };
    file
      .arrayBuffer()
      .then((buffer) => {
        const request: ParseRequest = { buffer, kind, name };
        worker.postMessage(request, [buffer]);
      })
      .catch((error: unknown) => setState({ status: 'error', message: String(error) }));
    return () => worker.terminate();
  }, [file, kind, name]);

  // Briefly show the zoom level after a pinch.
  useEffect(() => {
    if (firstZoom.current) {
      firstZoom.current = false;
      return;
    }
    setShowZoom(true);
    const timer = window.setTimeout(() => setShowZoom(false), 900);
    return () => window.clearTimeout(timer);
  }, [zoom]);

  if (state.status === 'loading') {
    return (
      <div className="viewer-message">
        <LoaderCircle className="spin" size={32} />
        <p>Reading spreadsheet…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="viewer-message error">
        <CircleAlert size={32} />
        <p>{state.message}</p>
      </div>
    );
  }

  const sheets = state.sheets;
  const sheet = sheets[Math.min(active, sheets.length - 1)];
  const value = selected ? (sheet.rows[selected.r]?.[selected.c] ?? '') : '';

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); nothing to do.
    }
  };

  return (
    <div className="sheet-viewer">
      <div className="formula-bar">
        <span className="cell-ref">{selected ? `${columnName(selected.c)}${selected.r + 1}` : ''}</span>
        <span className="fx" aria-hidden="true">
          fx
        </span>
        <div className="cell-value">
          {selected ? value || <span className="muted">(empty)</span> : <span className="muted">Tap a cell to see its full contents</span>}
        </div>
        {value && (
          <button className="icon-btn small" onClick={copyValue} aria-label="Copy cell contents">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>

      <div className="sheet-area">
        <SheetGrid key={active} sheet={sheet} zoom={zoom} onZoom={setZoom} selected={selected} onSelect={setSelected} />
        {showZoom && <div className="zoom-badge">{Math.round(zoom * 100)}%</div>}
      </div>

      {kind === 'workbook' ? (
        <nav className="sheet-tabs" aria-label="Sheets">
          {sheets.map((s, index) => (
            <button
              key={`${index}:${s.name}`}
              className={index === active ? 'sheet-tab active' : 'sheet-tab'}
              onClick={() => {
                setActive(index);
                setSelected(null);
              }}
            >
              {s.name}
            </button>
          ))}
          <span className="sheet-info">
            {sheet.rowCount.toLocaleString()} rows · {sheet.colCount.toLocaleString()} cols
          </span>
        </nav>
      ) : (
        <div className="sheet-status">
          {sheet.rowCount.toLocaleString()} rows · {sheet.colCount.toLocaleString()} columns
        </div>
      )}
    </div>
  );
}
