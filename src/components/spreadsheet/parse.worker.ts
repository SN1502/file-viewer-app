/**
 * Parses spreadsheets off the main thread so large files don't freeze the UI.
 * Excel/ODS via SheetJS; CSV/TSV via PapaParse (keeps text exactly as written,
 * e.g. leading zeros in phone numbers or codes).
 */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Merge, ParseRequest, ParseResponse, SheetData } from './types';

const CHAR_PX = 7.2;
const CELL_PADDING_PX = 14;
const MIN_AUTO_WIDTH = 44;
const MAX_AUTO_WIDTH = 320;
const DEFAULT_WIDTH = 72;
const SAMPLE_ROWS = 400;
const MAX_MERGE_GROWTH = 60; // don't let a stray merge add hundreds of empty rows/cols

self.addEventListener('message', (event: MessageEvent<ParseRequest>) => {
  const { buffer, kind, name } = event.data;
  let response: ParseResponse;
  try {
    const sheets = kind === 'csv' ? parseDelimited(buffer, name) : parseWorkbook(buffer);
    response = { ok: true, sheets };
  } catch (error) {
    response = { ok: false, error: friendlyError(error) };
  }
  self.postMessage(response);
});

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/password|encrypt/i.test(message)) {
    return 'This workbook is password-protected. Encrypted Excel files can’t be opened yet.';
  }
  if (/unsupported file|invalid|corrupt|zip/i.test(message)) {
    return `This file looks damaged or isn’t a supported spreadsheet (${message}).`;
  }
  return message;
}

// ---------------------------------------------------------------- CSV / TSV

function decodeText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    // Older Windows exports (e.g. from Excel) are often in Windows-1252.
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

function parseDelimited(buffer: ArrayBuffer, name: string): SheetData[] {
  const text = decodeText(buffer);
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: false,
    delimitersToGuess: [',', ';', '\t', '|'],
  });
  const rows = result.data;
  while (rows.length && rows[rows.length - 1].every((cell) => cell === '')) rows.pop();

  let colCount = 0;
  for (const row of rows) if (row.length > colCount) colCount = row.length;

  return [
    {
      name: name.replace(/\.[^.]+$/, '') || 'Sheet1',
      rows,
      rowCount: rows.length,
      colCount,
      colWidths: columnWidths(rows, colCount, []),
      merges: [],
    },
  ];
}

// ------------------------------------------------------------ Excel / ODS

function parseWorkbook(buffer: ArrayBuffer): SheetData[] {
  const workbook = XLSX.read(new Uint8Array(buffer), {
    type: 'array',
    cellDates: false,
    cellFormula: false,
    cellHTML: false,
    // Needed for column widths / hidden columns and number formats.
    cellStyles: true,
    cellNF: true,
  });

  const hidden = new Set(
    (workbook.Workbook?.Sheets ?? []).filter((sheet) => sheet.Hidden).map((sheet) => sheet.name),
  );
  let names = workbook.SheetNames.filter((name) => !hidden.has(name));
  if (names.length === 0) names = workbook.SheetNames;

  return names.map((name) => readSheet(name, workbook.Sheets[name]));
}

function formatNumber(format: string, value: number): string | null {
  try {
    return XLSX.SSF.format(format, value);
  } catch {
    // Symbols like ₹ written without quotes (e.g. ₹#,##0.00) trip the parser;
    // quoting them is what Excel itself does.
    try {
      return XLSX.SSF.format(format.replace(/[^\x20-\x7e]+/g, (symbol) => `"${symbol}"`), value);
    } catch {
      return null;
    }
  }
}

function cellText(cell: XLSX.CellObject | undefined): string {
  if (!cell) return '';
  if (cell.w != null) return cell.w; // formatted as in Excel (dates, currency, %)
  if (cell.v == null) return '';
  if (cell.t === 'n' && cell.z) {
    // SheetJS leaves cells unformatted when it can't parse the number format.
    const formatted = formatNumber(String(cell.z), cell.v as number);
    if (formatted != null) return formatted;
  }
  if (cell.t === 'b') return cell.v ? 'TRUE' : 'FALSE';
  if (cell.v instanceof Date) return cell.v.toLocaleDateString();
  return String(cell.v);
}

function readSheet(name: string, sheet: XLSX.WorkSheet | undefined): SheetData {
  const rows: (string[] | undefined)[] = [];
  let maxRow = -1;
  let maxCol = -1;

  if (sheet) {
    for (const address of Object.keys(sheet)) {
      if (address.charCodeAt(0) === 33 /* "!" = sheet metadata */) continue;
      const text = cellText(sheet[address] as XLSX.CellObject);
      if (text === '') continue;
      const { r, c } = XLSX.utils.decode_cell(address);
      (rows[r] ??= [])[c] = text;
      if (r > maxRow) maxRow = r;
      if (c > maxCol) maxCol = c;
    }
  }

  const merges: Merge[] = [];
  const dataRows = maxRow;
  const dataCols = maxCol;
  for (const range of sheet?.['!merges'] ?? []) {
    if (range.s.r > dataRows || range.s.c > dataCols) continue;
    const merge = {
      r0: range.s.r,
      c0: range.s.c,
      r1: Math.min(range.e.r, dataRows + MAX_MERGE_GROWTH),
      c1: Math.min(range.e.c, dataCols + MAX_MERGE_GROWTH),
    };
    if (merge.r1 === merge.r0 && merge.c1 === merge.c0) continue;
    merges.push(merge);
    maxRow = Math.max(maxRow, merge.r1);
    maxCol = Math.max(maxCol, merge.c1);
  }

  const colCount = maxCol + 1;
  // Text in merged cells spans several columns, so it shouldn't widen the first one.
  const skip = new Set(merges.map((merge) => `${merge.r0}:${merge.c0}`));
  return {
    name,
    rows,
    rowCount: maxRow + 1,
    colCount,
    colWidths: columnWidths(rows, colCount, sheet?.['!cols'] ?? [], skip),
    merges,
  };
}

// ------------------------------------------------------------ Column widths

function longestLine(text: string): number {
  let longest = 0;
  for (const line of text.split('\n')) if (line.length > longest) longest = line.length;
  return longest;
}

function columnWidths(
  rows: (string[] | undefined)[],
  colCount: number,
  cols: XLSX.ColInfo[],
  skip: Set<string> = new Set(),
): number[] {
  const longest = new Array<number>(colCount).fill(0);
  const sampled = Math.min(rows.length, SAMPLE_ROWS);
  for (let r = 0; r < sampled; r++) {
    const row = rows[r];
    if (!row) continue;
    const end = Math.min(row.length, colCount);
    for (let c = 0; c < end; c++) {
      const text = row[c];
      if (text && !skip.has(`${r}:${c}`)) {
        const length = longestLine(text);
        if (length > longest[c]) longest[c] = length;
      }
    }
  }

  const widths = new Array<number>(colCount);
  for (let c = 0; c < colCount; c++) {
    const info = cols[c];
    if (info?.hidden) widths[c] = 0;
    else if (info?.wpx) widths[c] = Math.round(info.wpx);
    else if (info?.wch) widths[c] = Math.round(info.wch * 7 + 5);
    else if (info?.width) widths[c] = Math.round(info.width * 7 + 5);
    else if (longest[c]) {
      widths[c] = Math.round(Math.min(MAX_AUTO_WIDTH, Math.max(MIN_AUTO_WIDTH, longest[c] * CHAR_PX + CELL_PADDING_PX)));
    } else widths[c] = DEFAULT_WIDTH;
  }
  return widths;
}
