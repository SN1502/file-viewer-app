// Copies the PDF.js data files (CMaps, standard fonts, image decoders, ICC
// profiles) into public/pdfjs so PDFs render correctly offline.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../node_modules/pdfjs-dist/', import.meta.url));
const target = fileURLToPath(new URL('../public/pdfjs/', import.meta.url));

rmSync(target, { recursive: true, force: true });
for (const dir of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  if (!existsSync(source + dir)) {
    console.warn(`pdfjs-dist/${dir} not found, skipping`);
    continue;
  }
  cpSync(source + dir, target + dir, { recursive: true });
}
console.log('Copied PDF.js assets to public/pdfjs');
