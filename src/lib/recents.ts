import type { DocKind } from './fileTypes';

/**
 * Recently opened documents, kept in IndexedDB with a copy of the file so they
 * can be reopened later (files shared from other apps are only readable once).
 */
export interface RecentFile {
  id: string;
  name: string;
  kind: DocKind;
  mime: string;
  size: number;
  openedAt: number;
}

interface StoredRecent extends RecentFile {
  blob: Blob;
}

const DB_NAME = 'file-viewer';
const STORE = 'recents';
const MAX_ITEMS = 20;
const MAX_FILE_BYTES = 80 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

async function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = run(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request ? request.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function allRecords(): Promise<StoredRecent[]> {
  const records = (await transaction('readonly', (store) => store.getAll())) as StoredRecent[] | undefined;
  return (records ?? []).sort((a, b) => b.openedAt - a.openedAt);
}

export function recentId(name: string, size: number): string {
  return `${name}\u0000${size}`;
}

export async function listRecents(): Promise<RecentFile[]> {
  try {
    return (await allRecords()).map(({ blob: _blob, ...meta }) => meta);
  } catch (error) {
    console.warn('Could not read recent files', error);
    return [];
  }
}

export async function saveRecent(name: string, kind: DocKind, blob: Blob): Promise<void> {
  if (blob.size > MAX_FILE_BYTES) return;
  const record: StoredRecent = {
    id: recentId(name, blob.size),
    name,
    kind,
    mime: blob.type,
    size: blob.size,
    openedAt: Date.now(),
    blob,
  };
  try {
    await transaction('readwrite', (store) => store.put(record));
    await prune();
  } catch (error) {
    console.warn('Could not save to recent files', error);
  }
}

export async function markOpened(id: string): Promise<void> {
  try {
    const record = (await transaction('readonly', (store) => store.get(id))) as StoredRecent | undefined;
    if (record) await transaction('readwrite', (store) => store.put({ ...record, openedAt: Date.now() }));
  } catch (error) {
    console.warn('Could not update recent file', error);
  }
}

export async function getRecentBlob(id: string): Promise<Blob | undefined> {
  const record = (await transaction('readonly', (store) => store.get(id))) as StoredRecent | undefined;
  return record?.blob;
}

export async function removeRecent(id: string): Promise<void> {
  await transaction('readwrite', (store) => store.delete(id));
}

export async function clearRecents(): Promise<void> {
  await transaction('readwrite', (store) => store.clear());
}

async function prune(): Promise<void> {
  const records = await allRecords();
  let total = 0;
  const stale: string[] = [];
  records.forEach((record, index) => {
    total += record.size;
    if (index >= MAX_ITEMS || total > MAX_TOTAL_BYTES) stale.push(record.id);
  });
  if (stale.length) {
    await transaction('readwrite', (store) => {
      stale.forEach((id) => store.delete(id));
    });
  }
}
