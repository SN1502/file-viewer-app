export interface Merge {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

export interface SheetData {
  name: string;
  /** rows[r][c] is the cell's display text; missing rows/cells are empty. */
  rows: (string[] | undefined)[];
  rowCount: number;
  colCount: number;
  /** Column widths in CSS px at 100% zoom; 0 means hidden. */
  colWidths: number[];
  merges: Merge[];
}

export interface ParseRequest {
  buffer: ArrayBuffer;
  kind: 'workbook' | 'csv';
  name: string;
}

export type ParseResponse = { ok: true; sheets: SheetData[] } | { ok: false; error: string };
