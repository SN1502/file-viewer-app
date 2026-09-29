import { CircleAlert, LoaderCircle, Lock, Minus, Plus } from 'lucide-react';
// The "legacy" build includes polyfills for JS features that Android System
// WebView may not have yet (e.g. Map.prototype.getOrInsertComputed).
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist/legacy/build/pdf.mjs';
// Bundled with the app so PDFs open offline.
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { clamp } from '../../lib/format';
import { anchoredScroll, clearPreview, previewScale, usePinchZoom } from '../../lib/usePinchZoom';
import './pdf.css';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// Fonts, character maps and image decoders, copied into public/pdfjs at build time.
const assetDir = (dir: string) => new URL(`pdfjs/${dir}/`, document.baseURI).href;

const PAGE_GAP = 10;
const SIDE_PAD = 8;
const MIN_ZOOM = 0.5; // relative to fit-width
const MAX_ZOOM = 5;
// Cap the canvas size per page to keep memory in check on phones.
const MAX_CANVAS_PIXELS = 8_000_000;

interface PageSize {
  w: number;
  h: number;
}

type Status =
  | { kind: 'loading' }
  | { kind: 'password'; incorrect: boolean }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

function pageAt(tops: Float64Array, y: number): number {
  let lo = 0;
  let hi = tops.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (tops[mid] <= y) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export default function PdfViewer({ file }: { file: Blob }) {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [passwordAttempt, setPasswordAttempt] = useState<{ value: string } | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [zoom, setZoom] = useState(1);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [range, setRange] = useState({ first: 0, last: 0, current: 0 });
  const [jumping, setJumping] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);

  // ------------------------------------------------------------------ loading
  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;
    setDoc(null);
    setStatus({ kind: 'loading' });

    (async () => {
      const data = new Uint8Array(await file.arrayBuffer());
      task = pdfjs.getDocument({
        data,
        password: passwordAttempt?.value,
        cMapUrl: assetDir('cmaps'),
        cMapPacked: true,
        standardFontDataUrl: assetDir('standard_fonts'),
        wasmUrl: assetDir('wasm'),
        iccUrl: assetDir('iccs'),
      });
      const pdf = await task.promise;
      if (cancelled) return;
      const first = (await pdf.getPage(1)).getViewport({ scale: 1 });
      if (cancelled) return;

      const all: PageSize[] = Array.from({ length: pdf.numPages }, () => ({ w: first.width, h: first.height }));
      setSizes(all);
      setDoc(pdf);
      setStatus({ kind: 'ready' });

      // Documents can mix page sizes and orientations; learn them in the background.
      let changed = false;
      for (let i = 2; i <= pdf.numPages && !cancelled; i++) {
        const viewport = (await pdf.getPage(i)).getViewport({ scale: 1 });
        if (viewport.width !== first.width || viewport.height !== first.height) {
          all[i - 1] = { w: viewport.width, h: viewport.height };
          changed = true;
        }
        if (changed && !cancelled && (i % 20 === 0 || i === pdf.numPages)) {
          setSizes([...all]);
          changed = false;
        }
      }
    })().catch((error: { name?: string; code?: number; message?: string }) => {
      if (cancelled) return;
      if (error?.name === 'PasswordException') {
        setStatus({ kind: 'password', incorrect: error.code === pdfjs.PasswordResponses.INCORRECT_PASSWORD });
      } else if (error?.name === 'InvalidPDFException') {
        setStatus({ kind: 'error', message: 'This file is damaged or isn’t a valid PDF.' });
      } else {
        setStatus({ kind: 'error', message: error?.message ?? String(error) });
      }
    });

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [file, passwordAttempt]);

  // ------------------------------------------------------------------- layout
  useEffect(() => {
    if (!scroller) return;
    const measure = () => setBox({ width: scroller.clientWidth, height: scroller.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [scroller]);

  // Every page is fitted to the screen width (like Adobe's continuous mode),
  // so portrait and landscape pages both fill the screen at 100%.
  const layout = useMemo(() => {
    const available = Math.max(1, box.width - SIDE_PAD * 2);
    const scales = new Float64Array(sizes.length);
    const tops = new Float64Array(sizes.length);
    let y = PAGE_GAP;
    let widest = 0;
    sizes.forEach((size, i) => {
      const scale = (box.width > 0 ? available / size.w : 1) * zoom;
      scales[i] = scale;
      tops[i] = y;
      y += size.h * scale + PAGE_GAP;
      widest = Math.max(widest, size.w * scale);
    });
    return { scales, tops, height: y, width: Math.max(box.width, widest + SIDE_PAD * 2) };
  }, [sizes, box.width, zoom]);

  const updateRange = useCallback(() => {
    if (!scroller || sizes.length === 0) return;
    const { scrollTop, clientHeight, scrollHeight } = scroller;
    const buffer = clientHeight * 0.75;
    const first = pageAt(layout.tops, scrollTop - buffer);
    const last = pageAt(layout.tops, scrollTop + clientHeight + buffer);
    // At the very end, the last page is "current" even if it's short.
    const atEnd = scrollTop + clientHeight >= scrollHeight - 2;
    const current = atEnd ? sizes.length - 1 : pageAt(layout.tops, scrollTop + clientHeight * 0.35);
    setRange((prev) =>
      prev.first === first && prev.last === last && prev.current === current ? prev : { first, last, current },
    );
  }, [scroller, sizes.length, layout]);

  useLayoutEffect(() => {
    if (scroller && pendingScroll.current) {
      scroller.scrollLeft = pendingScroll.current.left;
      scroller.scrollTop = pendingScroll.current.top;
      pendingScroll.current = null;
    }
    clearPreview(contentRef.current);
    updateRange();
  }, [scroller, updateRange]);

  useEffect(() => {
    if (!scroller) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          updateRange();
        });
      }
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [scroller, updateRange]);

  // --------------------------------------------------------------------- zoom
  const zoomTo = useCallback(
    (next: number, x: number, y: number) => {
      const target = clamp(next, MIN_ZOOM, MAX_ZOOM);
      if (!scroller || Math.abs(target - zoom) < 0.001) {
        clearPreview(contentRef.current);
        return;
      }
      pendingScroll.current = anchoredScroll(scroller, target / zoom, x, y);
      setZoom(target);
    },
    [scroller, zoom],
  );

  usePinchZoom(scroller, {
    onPinch: (scale, x, y) =>
      previewScale(contentRef.current, scroller, clamp(zoom * scale, MIN_ZOOM, MAX_ZOOM) / zoom, x, y),
    onPinchEnd: (scale, x, y) => zoomTo(zoom * scale, x, y),
    onDoubleTap: (x, y) => zoomTo(zoom > 1.1 ? 1 : 2.2, x, y),
  });

  const zoomStep = (factor: number) => zoomTo(zoom * factor, box.width / 2, box.height / 2);

  const goToPage = (page: number) => {
    if (!scroller) return;
    const index = clamp(Math.round(page), 1, sizes.length) - 1;
    scroller.scrollTop = layout.tops[index] - PAGE_GAP / 2;
  };

  // ------------------------------------------------------------------- render
  if (status.kind === 'password') {
    return <PasswordPrompt incorrect={status.incorrect} onSubmit={(value) => setPasswordAttempt({ value })} />;
  }
  if (status.kind === 'error') {
    return (
      <div className="viewer-message error">
        <CircleAlert size={32} />
        <p>{status.message}</p>
      </div>
    );
  }

  const pages = [];
  if (doc) {
    for (let i = range.first; i <= Math.min(range.last, sizes.length - 1); i++) {
      const width = sizes[i].w * layout.scales[i];
      const height = sizes[i].h * layout.scales[i];
      pages.push(
        <PdfPage
          key={i}
          pdf={doc}
          pageNumber={i + 1}
          scale={layout.scales[i]}
          left={(layout.width - width) / 2}
          top={layout.tops[i]}
          width={width}
          height={height}
        />,
      );
    }
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-scroll" ref={setScroller}>
        <div className="pdf-content" ref={contentRef} style={{ width: layout.width, height: layout.height }}>
          {pages}
        </div>
      </div>

      {status.kind === 'loading' && (
        <div className="viewer-message overlay">
          <LoaderCircle className="spin" size={32} />
          <p>Opening PDF…</p>
        </div>
      )}

      {status.kind === 'ready' && (
        <div className="pdf-hud">
          {jumping ? (
            <form
              className="page-pill"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const value = Number(new FormData(event.currentTarget).get('page'));
                if (value) goToPage(value);
                setJumping(false);
              }}
            >
              <input
                name="page"
                type="number"
                inputMode="numeric"
                min={1}
                max={sizes.length}
                defaultValue={range.current + 1}
                autoFocus
                onBlur={() => setJumping(false)}
                aria-label="Go to page"
              />
              <span>/ {sizes.length}</span>
            </form>
          ) : (
            <button className="page-pill" onClick={() => setJumping(true)} aria-label="Go to page">
              {range.current + 1} / {sizes.length}
            </button>
          )}
          <div className="zoom-buttons">
            <button className="round-btn" onClick={() => zoomStep(1 / 1.25)} aria-label="Zoom out">
              <Minus size={18} />
            </button>
            <button className="round-btn" onClick={() => zoomStep(1.25)} aria-label="Zoom in">
              <Plus size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface PageProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

/** One page. Re-renders when the zoom changes, keeping the old image until the new one is ready. */
const PdfPage = memo(function PdfPage({ pdf, pageNumber, scale, left, top, width, height }: PageProps) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let task: RenderTask | null = null;
    // A short delay skips pages that are only flicked past.
    const timer = window.setTimeout(async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;
        const outputScale = Math.min(dpr, Math.sqrt(MAX_CANVAS_PIXELS / (viewport.width * viewport.height)));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
        canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
        task = page.render({
          canvas,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        });
        await task.promise;
        if (cancelled || !holder.current) return;
        holder.current.replaceChildren(canvas);
      } catch (error) {
        if (!cancelled && (error as Error)?.name !== 'RenderingCancelledException') {
          console.error(`Failed to render page ${pageNumber}`, error);
        }
      }
    }, 40);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      task?.cancel();
    };
  }, [pdf, pageNumber, scale]);

  return (
    <div className="pdf-page" style={{ left, top, width, height }}>
      <div className="pdf-page-image" ref={holder} />
    </div>
  );
});

function PasswordPrompt({ incorrect, onSubmit }: { incorrect: boolean; onSubmit(password: string): void }) {
  return (
    <div className="viewer-message">
      <form
        className="password-card"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(String(new FormData(event.currentTarget).get('password') ?? ''));
        }}
      >
        <Lock size={32} />
        <h2>This PDF is password-protected</h2>
        <p>Enter the password to open it.</p>
        <input name="password" type="password" autoFocus autoComplete="off" aria-label="PDF password" />
        {incorrect && <p className="form-error">Incorrect password. Try again.</p>}
        <button className="primary-btn" type="submit">
          Open
        </button>
      </form>
    </div>
  );
}
