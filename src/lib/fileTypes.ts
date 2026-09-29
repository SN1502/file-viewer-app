export type DocKind = 'pdf' | 'workbook' | 'csv';

const EXTENSIONS: Record<string, DocKind> = {
  pdf: 'pdf',
  xlsx: 'workbook',
  xlsm: 'workbook',
  xlsb: 'workbook',
  xls: 'workbook',
  xltx: 'workbook',
  xltm: 'workbook',
  ods: 'workbook',
  csv: 'csv',
  tsv: 'csv',
};

// Canonical spellings: Android matches MIME types case-sensitively.
const MIME_TYPES: Record<string, DocKind> = {
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'workbook',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'workbook',
  'application/vnd.ms-excel': 'workbook',
  'application/vnd.ms-excel.sheet.macroEnabled.12': 'workbook',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12': 'workbook',
  'application/vnd.oasis.opendocument.spreadsheet': 'workbook',
  'text/csv': 'csv',
  'text/comma-separated-values': 'csv',
  'text/x-csv': 'csv',
  'text/x-comma-separated-values': 'csv',
  'application/csv': 'csv',
  'application/x-csv': 'csv',
  'text/tab-separated-values': 'csv',
};

const MIME_LOWER = new Map(Object.entries(MIME_TYPES).map(([mime, kind]) => [mime.toLowerCase(), kind]));

/** Value for <input type="file" accept>; the Android picker filters by these. */
export const ACCEPT = [
  ...Object.keys(EXTENSIONS).map((ext) => `.${ext}`),
  ...Object.keys(MIME_TYPES),
].join(',');

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/**
 * Decides how to show a file: by extension, then MIME type, then by its first
 * bytes (files shared from some apps arrive without a usable name or type).
 */
export async function detectKind(file: Blob, name: string, mime: string): Promise<DocKind | null> {
  const byExtension = EXTENSIONS[extensionOf(name)];
  if (byExtension) return byExtension;

  const byMime = MIME_LOWER.get(mime.toLowerCase());
  if (byMime) return byMime;

  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const startsWith = (...bytes: number[]) => bytes.every((byte, i) => head[i] === byte);
  if (startsWith(0x25, 0x50, 0x44, 0x46)) return 'pdf'; // "%PDF"
  if (startsWith(0x50, 0x4b, 0x03, 0x04)) return 'workbook'; // zip container: xlsx, ods
  if (startsWith(0xd0, 0xcf, 0x11, 0xe0)) return 'workbook'; // OLE container: xls
  if (mime.startsWith('text/')) return 'csv';
  return null;
}

export function typeLabel(name: string, kind: DocKind): string {
  const ext = extensionOf(name);
  if (ext) return ext.toUpperCase();
  return kind === 'pdf' ? 'PDF' : kind === 'csv' ? 'CSV' : 'Spreadsheet';
}
