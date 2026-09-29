import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { clamp } from '../../lib/format';
import { anchoredScroll, clearPreview, previewScale, usePinchZoom } from '../../lib/usePinchZoom';
import type { Merge, SheetData } from './types';

export interface CellRef {
  r: number;
  c: number;
}

// Sizes in CSS px at 100% zoom (close to Excel's defaults).
const ROW_H = 24;
const HEADER_H = 24;
const FONT_PX = 13;
const PAD_PX = 5;
const CHAR_PX = 7.2;
const DEFAULT_COL_W = 72;
// Blank rows/columns after the data, like Excel shows.
const EXTRA_ROWS = 30;
const EXTRA_COLS = 6;
const OVERSCAN_ROWS = 10;
const OVERSCAN_PX = 240;
// How far left to look for text that spills into the visible columns.
const OVERFLOW_LOOKBACK = 8;
const MAX_OVERFLOW_COLS = 16;
export const MIN_ZOOM = 0.35;
export const MAX_ZOOM = 3;
// Browsers can't lay out elements much taller than ~33M px.
const MAX_CONTENT_PX = 30_000_000;

export function columnName(index: number): string {
  let name = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

const NUMERIC = /^[-+]?\(?[$€£¥₹]?\s?(\d[\d,]*(\.\d+)?|\.\d+)([eE][-+]?\d+)?\)?\s?%?$/;
export function looksNumeric(text: string): boolean {
  return text.length <= 30 && NUMERIC.test(text.trim());
}

const cellKey = (r: number, c: number) => r * 20000 + c; // Excel allows 16,384 columns

function columnAt(lefts: Float64Array, x: number, count: number): number {
  let lo = 0;
  let hi = count - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lefts[mid] <= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function estimateWidth(text: string): number {
  const newline = text.indexOf('\n');
  const firstLine = newline === -1 ? text : text.slice(0, newline);
  return firstLine.length * CHAR_PX + PAD_PX * 2;
}

interface Range {
  r0: number;
  r1: number;
  c0: number;
  c1: number;
}

interface Props {
  sheet: SheetData;
  zoom: number;
  onZoom(zoom: number): void;
  selected: CellRef | null;
  onSelect(cell: CellRef): void;
}

export default function SheetGrid({ sheet, zoom: requestedZoom, onZoom, selected, onSelect }: Props) {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);

  const totalRows = sheet.rowCount + EXTRA_ROWS;
  const totalCols = sheet.colCount + EXTRA_COLS;
  const maxZoom = Math.min(MAX_ZOOM, MAX_CONTENT_PX / (totalRows * ROW_H));
  const zoom = Math.min(requestedZoom, maxZoom);

  const layout = useMemo(() => {
    const widths = new Float64Array(totalCols);
    const lefts = new Float64Array(totalCols + 1);
    for (let c = 0; c < totalCols; c++) {
      const base = c < sheet.colCount ? (sheet.colWidths[c] ?? DEFAULT_COL_W) : DEFAULT_COL_W;
      widths[c] = base * zoom;
      lefts[c + 1] = lefts[c] + widths[c];
    }
    const rowH = ROW_H * zoom;
    const headerH = HEADER_H * zoom;
    const rowHeaderW = Math.max(34, String(totalRows).length * 8 + 16) * zoom;
    return {
      widths,
      lefts,
      rowH,
      headerH,
      rowHeaderW,
      width: rowHeaderW + lefts[totalCols],
      height: headerH + totalRows * rowH,
    };
  }, [sheet, zoom, totalRows, totalCols]);

  const merges = useMemo(() => {
    const anchors = new Map<number, Merge>();
    const covered = new Map<number, Merge>();
    for (const merge of sheet.merges) {
      anchors.set(cellKey(merge.r0, merge.c0), merge);
      if ((merge.r1 - merge.r0 + 1) * (merge.c1 - merge.c0 + 1) > 50_000) continue;
      for (let r = merge.r0; r <= merge.r1; r++) {
        for (let c = merge.c0; c <= merge.c1; c++) {
          if (r !== merge.r0 || c !== merge.c0) covered.set(cellKey(r, c), merge);
        }
      }
    }
    return { anchors, covered };
  }, [sheet]);

  // ------------------------------------------------------------ virtualization
  const [range, setRange] = useState<Range>({ r0: 0, r1: 40, c0: 0, c1: 12 });

  const updateRange = useCallback(() => {
    if (!scroller) return;
    const { scrollTop, scrollLeft, clientWidth, clientHeight } = scroller;
    const top = scrollTop - layout.headerH;
    const left = scrollLeft - layout.rowHeaderW;
    const next: Range = {
      r0: clamp(Math.floor(top / layout.rowH) - OVERSCAN_ROWS, 0, totalRows - 1),
      r1: clamp(Math.ceil((top + clientHeight) / layout.rowH) + OVERSCAN_ROWS, 0, totalRows - 1),
      c0: columnAt(layout.lefts, Math.max(0, left - OVERSCAN_PX), totalCols),
      c1: columnAt(layout.lefts, Math.max(0, left + clientWidth + OVERSCAN_PX), totalCols),
    };
    setRange((prev) =>
      prev.r0 === next.r0 && prev.r1 === next.r1 && prev.c0 === next.c0 && prev.c1 === next.c1 ? prev : next,
    );
  }, [scroller, layout, totalRows, totalCols]);

  // After a zoom: keep the pinched point in place, drop the preview, re-window.
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
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          updateRange();
        });
      }
    };
    scroller.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [scroller, updateRange]);

  // --------------------------------------------------------------------- zoom
  const zoomTo = useCallback(
    (next: number, x: number, y: number) => {
      const target = clamp(next, MIN_ZOOM, maxZoom);
      if (!scroller || Math.abs(target - zoom) < 0.001) {
        clearPreview(contentRef.current);
        return;
      }
      pendingScroll.current = anchoredScroll(scroller, target / zoom, x, y);
      onZoom(target);
    },
    [scroller, zoom, maxZoom, onZoom],
  );

  usePinchZoom(scroller, {
    onPinch: (scale, x, y) =>
      previewScale(contentRef.current, scroller, clamp(zoom * scale, MIN_ZOOM, maxZoom) / zoom, x, y),
    onPinchEnd: (scale, x, y) => zoomTo(zoom * scale, x, y),
    onDoubleTap: (x, y) => zoomTo(zoom < 1.4 ? 1.8 : 1, x, y),
  });

  // -------------------------------------------------------------------- cells
  const cells = useMemo(() => {
    const out: ReactElement[] = [];
    const { widths, lefts, rowH } = layout;
    const drawn = new Set<Merge>();

    const drawMerge = (merge: Merge) => {
      if (drawn.has(merge)) return;
      drawn.add(merge);
      const text = sheet.rows[merge.r0]?.[merge.c0] ?? '';
      const lastCol = Math.min(merge.c1, totalCols - 1);
      out.push(
        <div
          key={`m${merge.r0}:${merge.c0}`}
          className={looksNumeric(text) ? 'cell merged num' : 'cell merged'}
          style={{
            left: lefts[merge.c0],
            top: merge.r0 * rowH,
            width: lefts[lastCol + 1] - lefts[merge.c0] - 1,
            height: (merge.r1 - merge.r0 + 1) * rowH - 1,
          }}
        >
          {text}
        </div>,
      );
    };

    for (let r = range.r0; r <= range.r1; r++) {
      const row = sheet.rows[r];
      const top = r * rowH;
      let spilledUntil = -1;
      for (let c = Math.max(0, range.c0 - OVERFLOW_LOOKBACK); c <= range.c1; c++) {
        const key = cellKey(r, c);
        const coveredBy = merges.covered.get(key);
        if (coveredBy) {
          drawMerge(coveredBy);
          continue;
        }
        const anchor = merges.anchors.get(key);
        if (anchor) {
          drawMerge(anchor);
          continue;
        }
        if (c <= spilledUntil) continue;
        const text = row?.[c];
        if (!text || widths[c] === 0) continue;

        // Like Excel, left-aligned text spills into empty cells to its right.
        const numeric = looksNumeric(text);
        let end = c;
        let width = widths[c];
        if (!numeric) {
          const needed = estimateWidth(text) * zoom;
          while (width < needed && end + 1 < totalCols && end - c < MAX_OVERFLOW_COLS) {
            const next = end + 1;
            const nextKey = cellKey(r, next);
            if (row?.[next] || merges.anchors.has(nextKey) || merges.covered.has(nextKey)) break;
            end = next;
            width += widths[next];
          }
          spilledUntil = end;
        }
        if (end < range.c0) continue;

        out.push(
          <div
            key={key}
            className={numeric ? 'cell num' : 'cell'}
            style={{ left: lefts[c], top, width: width - 1, height: rowH - 1 }}
          >
            {text}
          </div>,
        );
      }
    }
    return out;
  }, [layout, range, sheet, merges, totalCols, zoom]);

  const gridLines = useMemo(() => {
    const lines: ReactElement[] = [];
    const top = range.r0 * layout.rowH;
    const height = (range.r1 - range.r0 + 1) * layout.rowH;
    for (let c = range.c0; c <= range.c1; c++) {
      if (layout.widths[c] === 0) continue;
      lines.push(<div key={c} className="vline" style={{ left: layout.lefts[c + 1] - 1, top, height }} />);
    }
    return lines;
  }, [layout, range]);

  // ------------------------------------------------------------ selection
  const selection = useMemo(() => {
    if (!selected) return null;
    const merge = merges.anchors.get(cellKey(selected.r, selected.c));
    const r0 = selected.r;
    const c0 = selected.c;
    const r1 = merge ? merge.r1 : r0;
    const c1 = Math.min(merge ? merge.c1 : c0, totalCols - 1);
    return { r0, c0, r1, c1 };
  }, [selected, merges, totalCols]);

  const onCellsClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const r = Math.floor((event.clientY - rect.top) / layout.rowH);
    const c = columnAt(layout.lefts, event.clientX - rect.left, totalCols);
    if (r < 0 || r >= totalRows) return;
    const key = cellKey(r, c);
    const merge = merges.anchors.get(key) ?? merges.covered.get(key);
    onSelect(merge ? { r: merge.r0, c: merge.c0 } : { r, c });
  };

  const columnHeaders: ReactElement[] = [];
  for (let c = range.c0; c <= range.c1; c++) {
    if (layout.widths[c] === 0) continue;
    const active = selection && c >= selection.c0 && c <= selection.c1;
    columnHeaders.push(
      <div
        key={c}
        className={active ? 'col-head active' : 'col-head'}
        style={{ left: layout.rowHeaderW + layout.lefts[c], width: layout.widths[c] }}
      >
        {columnName(c)}
      </div>,
    );
  }

  const rowHeaders: ReactElement[] = [];
  for (let r = range.r0; r <= range.r1; r++) {
    const active = selection && r >= selection.r0 && r <= selection.r1;
    rowHeaders.push(
      <div key={r} className={active ? 'row-head active' : 'row-head'} style={{ top: r * layout.rowH, height: layout.rowH }}>
        {r + 1}
      </div>,
    );
  }

  return (
    <div className="grid-scroll" ref={setScroller}>
      <div
        className="grid-content"
        ref={contentRef}
        style={
          {
            width: layout.width,
            height: layout.height,
            '--fs': `${FONT_PX * zoom}px`,
            '--pad': `${PAD_PX * zoom}px`,
            '--row-h': `${layout.rowH}px`,
          } as CSSProperties
        }
      >
        <div className="grid-col-heads" style={{ height: layout.headerH, width: layout.width }}>
          <div className="grid-corner" style={{ width: layout.rowHeaderW, height: layout.headerH }} />
          {columnHeaders}
        </div>
        <div className="grid-row-heads" style={{ width: layout.rowHeaderW, height: totalRows * layout.rowH }}>
          {rowHeaders}
        </div>
        <div
          className="grid-cells"
          style={{
            left: layout.rowHeaderW,
            top: layout.headerH,
            width: layout.lefts[totalCols],
            height: totalRows * layout.rowH,
          }}
          onClick={onCellsClick}
        >
          {gridLines}
          {cells}
          {selection && (
            <div
              className="grid-selection"
              style={{
                left: layout.lefts[selection.c0] - 1,
                top: selection.r0 * layout.rowH - 1,
                width: layout.lefts[selection.c1 + 1] - layout.lefts[selection.c0] + 1,
                height: (selection.r1 - selection.r0 + 1) * layout.rowH + 1,
              }}
            />
          )}
        </div>
      </div>
      {sheet.rowCount === 0 && <div className="grid-empty">This sheet is empty</div>}
    </div>
  );
}
