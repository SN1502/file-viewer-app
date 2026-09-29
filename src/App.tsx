import { LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import DocumentScreen from './components/DocumentScreen';
import HomeScreen from './components/HomeScreen';
import { ACCEPT, detectKind, type DocKind } from './lib/fileTypes';
import { exitApp, listenForIncomingFiles, onBackButton } from './lib/native';
import {
  clearRecents,
  getRecentBlob,
  listRecents,
  markOpened,
  removeRecent,
  saveRecent,
  type RecentFile,
} from './lib/recents';
import './App.css';

export interface OpenDocument {
  key: number;
  name: string;
  kind: DocKind;
  file: Blob;
  size: number;
  /** "external" = handed over by another app; back then returns to that app. */
  source: 'picker' | 'external' | 'recent';
}

let nextKey = 1;

export default function App() {
  const [doc, setDoc] = useState<OpenDocument | null>(null);
  const [recents, setRecents] = useState<RecentFile[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef(0);
  const docRef = useRef<OpenDocument | null>(null);

  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  const refreshRecents = useCallback(async () => {
    setRecents(await listRecents());
  }, []);

  useEffect(() => {
    void refreshRecents();
  }, [refreshRecents]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  const openFile = useCallback(
    async (file: File, source: OpenDocument['source']) => {
      try {
        const kind = await detectKind(file, file.name, file.type);
        if (!kind) {
          showToast(`“${file.name}” isn’t a PDF, Excel or CSV file.`);
          return;
        }
        setDoc({ key: nextKey++, name: file.name, kind, file, size: file.size, source });
        await saveRecent(file.name, kind, file);
        await refreshRecents();
      } catch (error) {
        showToast(`Couldn’t open “${file.name}”: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setBusy(null);
      }
    },
    [refreshRecents, showToast],
  );

  const openRecent = useCallback(
    async (item: RecentFile) => {
      try {
        const blob = await getRecentBlob(item.id);
        if (!blob) {
          showToast('That file is no longer available.');
          await removeRecent(item.id);
          await refreshRecents();
          return;
        }
        setDoc({ key: nextKey++, name: item.name, kind: item.kind, file: blob, size: item.size, source: 'recent' });
        await markOpened(item.id);
        await refreshRecents();
      } catch (error) {
        showToast(`Couldn’t open “${item.name}”: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [refreshRecents, showToast],
  );

  // Files handed over by other apps ("Open with" / "Share").
  useEffect(
    () =>
      listenForIncomingFiles({
        onStart: (name) => setBusy(`Opening ${name}…`),
        onFile: (file) => void openFile(file, 'external'),
        onError: (message) => {
          setBusy(null);
          showToast(message);
        },
      }),
    [openFile, showToast],
  );

  // Android back: document → home, or back to the app that sent the file.
  useEffect(
    () =>
      onBackButton(() => {
        const current = docRef.current;
        if (current && current.source !== 'external') setDoc(null);
        else exitApp();
      }),
    [],
  );

  // Desktop: drop a file anywhere to open it.
  useEffect(() => {
    const onDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      const file = event.dataTransfer?.files?.[0];
      if (!file) return;
      event.preventDefault();
      void openFile(file, 'picker');
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [openFile]);

  const openPicker = () => inputRef.current?.click();

  const onPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void openFile(file, 'picker');
  };

  return (
    <>
      {doc ? (
        <DocumentScreen key={doc.key} doc={doc} onBack={() => setDoc(null)} onOpenAnother={openPicker} />
      ) : (
        <HomeScreen
          recents={recents}
          onOpenPicker={openPicker}
          onOpenRecent={(item) => void openRecent(item)}
          onRemoveRecent={(item) => void removeRecent(item.id).then(refreshRecents)}
          onClearRecents={() => void clearRecents().then(refreshRecents)}
        />
      )}

      <input ref={inputRef} type="file" accept={ACCEPT} onChange={onPicked} hidden />

      {busy && (
        <div className="busy-overlay" role="status">
          <LoaderCircle className="spin" size={28} />
          <span>{busy}</span>
        </div>
      )}
      {toast && (
        <div className="toast" role="alert" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}
    </>
  );
}
