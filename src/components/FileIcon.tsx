import { FileSpreadsheet, FileText, Sheet } from 'lucide-react';
import type { DocKind } from '../lib/fileTypes';

const ICONS = { pdf: FileText, workbook: FileSpreadsheet, csv: Sheet } as const;

export function FileIcon({ kind, size = 40 }: { kind: DocKind; size?: number }) {
  const Icon = ICONS[kind];
  return (
    <span className={`file-icon ${kind}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.55)} />
    </span>
  );
}
